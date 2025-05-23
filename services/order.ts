import { Order } from "models/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "./cart"
import { formatProductsForOrder, calcTotalPrice, formatItemsForPreference } from "utils/cart"
import { getDate, formatExpireDateForPreference } from "./dateFns"
import { createPreference, getMerchantOrderId, getPayment } from "./mercadopago"
import { saleAlert, purchaseAlert } from "./sendgrid"

export class OrderService {
    cart = new CartService(this.userRepo)
    constructor(private repo: OrderRepository, private userRepo: UserRepository) { }

    async getMyOrders(userId: string): Promise<OrderData[]> {
        try {
            const myOrders = await this.repo.getOrders(userId)
            return myOrders
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async getOrdersById(userId: string, orderId: string): Promise<OrderData> {
        try {
            const order = await this.repo.getOrderDoc(userId, orderId)
            return order.data
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async createOrder(userId: string, additionalInfo?: string): Promise<Order> {
        try {

            const getUserId = (await this.userRepo.getUser(userId)).id
            const cartData = await this.cart.getCartData(getUserId)
            const products = formatProductsForOrder(cartData)
            const totalPrice = calcTotalPrice(cartData)
            const order = await this.repo.newOrder({
                orderId: "",
                userId: getUserId,
                products: products,
                status: "pending",
                totalPrice: totalPrice,
                url: "",
                additionalInfo,
                created: getDate(),
                payment: null,
                expire: false,
            })
            return order
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async createPreference(userId: string): Promise<{ url: string }> {
        try {
            const order = await this.createOrder(userId)
            const { id, data } = order
            const cartData = await this.cart.getCartData(userId)
            const items = formatItemsForPreference(cartData)
            const userData = await this.userRepo.getUser(userId)
            const expireDatePreference = formatExpireDateForPreference()
            const urlData = await getBaseUrl(id)
            const newPreference = await createPreference({
                body:
                {
                    external_reference: id,
                    notification_url: urlData.notificationUrl,
                    items: items,
                    payer: {
                        name: userData.data.userName,
                        email: userData.data.email,
                        phone: {
                            number: userData.data.phoneNumber.toString()
                        }
                    },
                    back_urls: {
                        success: urlData.successUrl,
                        failure: urlData.failureUrl,
                        pending: urlData.pendingUrl
                    },
                    expires: true,
                    auto_return: "all",
                    additional_info: data.additionalInfo,
                    statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                    expiration_date_to: expireDatePreference,
                }
            })
            order.setOrderId(id)
            order.setUrl(newPreference.init_point)
            await Promise.all([
                this.repo.save(order),
                this.cart.reset(userId)
            ])
            return { url: order.data.url }
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async UpdateOrder(userId: string, orderId: string, topic: string, id: string): Promise<Order> {
        if (topic !== "merchant_order") return null
        try {
            const { order_status } = await getMerchantOrderId({ merchantOrderId: id as string })
            if (order_status !== "paid") return
            const order = await this.repo.getOrderDoc(userId, orderId)
            const user = await this.userRepo.getUser(userId)
            order.updateStatus(order_status)
            await Promise.all([
                this.repo.save(order),
                this.cart.reset(userId),
                purchaseAlert(user.data.email, user.data.userName, orderId),
                saleAlert(userId, orderId, order.data.totalPrice)
            ])
            return order
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async setPayment(userId: string, id: string): Promise<Order> {
        try {
            const data = await getPayment({ id: id })
            const orderId = data.external_reference
            const paymentData = {
                paymentId: data.id,//id
                paymentCreated: data.date_created,//fecha de pago
                currencyId: data.currency_id,//moneda de pago
                status: data.status,//status
                statusDetail: data.status_detail,//status detalles
                installments: data.installments,//cuotas
                paymentMethodId: data.payment_method_id,//metodo de pago
                paymentTypeId: data.payment_type_id,//tipo de metodo de pago
                transactionAmount: data.transaction_amount,//monto de la compra
                transactionInstallmentAmout: data.transaction_details.installment_amount,//monto de cuota
                transactionTotalAmount: data.transaction_details.total_paid_amount,//total de monto + financiacion
                fourDigitsCard: data.card.last_four_digits,//ultimos 4 digitos
            }
            const order = await this.repo.getOrderDoc(userId, orderId)
            order.setPayment(paymentData)
            await this.repo.save(order)
            return order
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async deleteOrderById(userId: string, orderId: string): Promise<boolean> {
        try {
            const deleteOrder = await this.repo.delete(userId, orderId)
            return deleteOrder
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }
}



