import { Order } from "models/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "./cart"
import { checkExpiration, formatExpireDateForPreference } from "./dateFns"
import { updateStockProducts, searchProductById } from "./algolia"
import { createPreference, getMerchantOrderId, getPayment } from "./mercadopago"
import { sendPaymentConfirmed, sendSaleConfirmed } from "./sendgrid"
import { getBaseUrl } from "utils/getBaseUrl"
import { formatTimestamp } from "utils/formatTimeStamp"
import { hasStock } from "utils/hasStock"
import { formatProducts } from "utils/formatProducts"
import { calcTotalPrice } from "utils/calcToPrice"
import { formatItems } from "utils/formatItems"

export class OrderService {
    constructor(private repo: Partial<OrderRepository>, private userRepo: Partial<UserRepository>, private cartService: Partial<CartService>) { }

    async checkExpirationOrders(orders: OrderData[]): Promise<void> {
        try {
            let orderExpires: string[] = []
            for (const item of orders) {
                const result = checkExpiration(item.created as FirestoreTimestamp, "expiredPayment") as number
                if (result >= 2) {
                    if (item.status !== "closed") {
                        const productsToReturn = await Promise.all(
                            item.products.map(async (p) => {
                                const product = await searchProductById(p.productId)
                                return {
                                    ...product,
                                    objectID: product.objectID,
                                    stock: product.stock,
                                    quantity: p.quantity
                                }
                            })
                        )
                        await updateStockProducts(productsToReturn, "add")
                        const order = await this.repo.getOrderDoc(item.userId, item.orderId)
                        order.updateExpire(true)
                        orderExpires.push(item.orderId)
                        await this.repo.save(order)
                    }
                }
            }
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async getMyOrders(userId: string): Promise<OrderData[]> {
        try {
            const myOrders = await this.repo.getOrders(userId)
            await this.checkExpirationOrders(myOrders)
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
            const cartData = await this.cartService.getCartData(getUserId)
            const stockData = hasStock(cartData)
            const products = formatProducts(cartData)
            const totalPrice = calcTotalPrice(cartData)
            const order = await this.repo.newOrder({
                orderId: null,
                userId: getUserId,
                products: products,
                status: "pending",
                totalPrice: totalPrice,
                url: null,
                additionalInfo: additionalInfo || null,
                created: new Date(),
                payment: null,
                expire: false,
            })
            await updateStockProducts(stockData, "subtract")
            return order
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async createPreference(userId: string, additionalInfo: string): Promise<{ url: string }> {
        try {
            const order = await this.createOrder(userId, additionalInfo)
            const { id, data } = order
            const cartData = await this.cartService.getCartData(userId)
            const items = formatItems(cartData)
            const userData = await this.userRepo.getUser(userId)
            const expireDatePreference = formatExpireDateForPreference()
            const urlData = getBaseUrl()
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
                this.cartService.reset(userId)
            ])
            return { url: order.data.url }
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async UpdateOrder(userId: string, topic: string, id: string): Promise<Order> {
        if (topic !== "merchant_order") return null
        try {
            const { order_status, external_reference } = await getMerchantOrderId({ merchantOrderId: id as string })
            if (order_status !== "paid") return null
            const order = await this.repo.getOrderDoc(userId, external_reference)
            const user = await this.userRepo.getUser(userId)
            order.updateStatus(order_status)
            await Promise.all([
                this.repo.save(order),
                sendPaymentConfirmed(user.data.email, user.data.userName, order.data),
                sendSaleConfirmed(user.data, order.data)
            ])
            return order
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async setPayment(userId: string, id: string): Promise<boolean> {
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
            return true
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

