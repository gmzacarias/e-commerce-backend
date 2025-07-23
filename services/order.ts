import { Order } from "models/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "./cart"
import { formatProductsForOrder, calcTotalPrice, formatItemsForPreference, hasStock } from "utils/cart"
import { checkExpirationPayments, formatExpireDateForPreference} from "./dateFns"
import { updateStockProducts } from "./algolia"
import { createPreference, getMerchantOrderId, getPayment } from "./mercadopago"
import { saleAlert, purchaseAlert } from "./sendgrid"
import { getBaseUrl } from "utils/getBaseUrl"
import { formatDate } from "utils/formatDate"

export class OrderService {
    constructor(private repo: Partial<OrderRepository>, private userRepo: Partial<UserRepository>, private cartService: Partial<CartService>) { }

    async checkExpirationOrders(orders: OrderData[]): Promise<void> {
        try {
            let orderExpires = []
            for (const item of orders) {
                const result = checkExpirationPayments(item.created as FirestoreTimestamp)
                if (result >= 2 || item.status === "closed") {
                    const order = await this.repo.getOrderDoc(item.userId, item.orderId)
                    order.updateExpire(true)
                    orderExpires.push(item.orderId)
                    await this.repo.save(order)
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
            const formatDateOrders = myOrders.map((item) => ({
                ...item,
                created: formatDate(item.created as FirestoreTimestamp).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
                ...(item.payment && {
                    payment: {
                        ...item.payment,
                        paymentCreated: new Date(item.payment.paymentCreated).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                        }),
                    },
                })
            }
            ))
            return formatDateOrders
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async getOrdersById(userId: string, orderId: string): Promise<OrderData> {
        try {
            const order = await this.repo.getOrderDoc(userId, orderId)
            const formatOrder = {
                ...order.data,
                created: formatDate(order.data.created as FirestoreTimestamp).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
                ...(order.data.payment && {
                    payment: {
                        ...order.data.payment,
                        paymentCreated: new Date(order.data.payment.paymentCreated).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                        }),
                    },
                })
            }
            return formatOrder
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
            const products = formatProductsForOrder(cartData)
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
            await updateStockProducts(stockData)
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
            const items = formatItemsForPreference(cartData)
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
                purchaseAlert(user.data.email, user.data.userName, order.data),
                saleAlert(user.data, order.data)
            ])
            return order
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async setPayment(userId: string, id: string): Promise<OrderData> {
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
            const formatOrder = {
                ...order.data,
                created: formatDate(order.data.created as FirestoreTimestamp).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
                payment: order.data.payment ? {
                    ...order.data.payment,
                    paymentCreated: new Date(order.data.payment.paymentCreated).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                    }),
                } : null
            }
            return formatOrder
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



