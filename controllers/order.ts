import { Order } from "models/order"
import { getDataById, resetCart } from "controllers/user"
import { createPreference, getMerchantOrderId, getPreference, getPayment } from "services/mercadopago"
import { getDate } from "utils/getDate"
import { expirePreference } from "utils/expireDate"
import { createItemsCart, getCartTotalPrice, prepareProductsToCart } from "services/cart"
import { purchaseAlert, saleAlert } from "services/sendgrid"
import { getNgrokUrl } from "services/ngrok"
import { base } from "airtable"

export async function getMyOrders(userId: string): Promise<OrderData[]> {
    try {
        const orders = await Order.getOrders(userId)
        return orders
    } catch (error) {
        console.error(`error al obtener la order del user ${userId}:${error.message}`)
        throw error
    }
}

export async function getOrderDataById(userId: string, orderId: string): Promise<OrderData> {
    try {
        const order = await Order.getOrderById(userId, orderId)
        return order
    } catch (error) {
        console.error(`error al obtener la order ${orderId}:${error.message}`)
        throw error
    }
}

export async function createOrder(userId: string, additionalInfo: string,): Promise<{ url: string }> {
    try {
        const productIds = await prepareProductsToCart(userId)
        const totalPrice = await getCartTotalPrice(userId)
        const order = await Order.createNewOrder({
            orderId: "",
            userId: userId,
            products: productIds,
            status: "pending",
            totalPrice: totalPrice,
            url: "",
            additionalInfo,
            created: getDate(),
            payment: [],
            expire: false,
        })
        const currentNgrokUrl = await getNgrokUrl()
        const isDev = process.env.NODE_ENV === "development"
        const notificationUrl = isDev ? `${currentNgrokUrl}/api/ipn/mercadopago` : "https://e-commerce-backend-lake.vercel.app/api/ipn/mercadopago"
        const baseFrontEndUrl = isDev ? `${currentNgrokUrl}` : "https://e-commerce-smartshop.vercel.app"
        const successUrl = `${baseFrontEndUrl}/checkoutStatus/${order.id}?status=success`
        const pendingUrl = `${baseFrontEndUrl}/checkoutStatus/${order.id}?status=pending`
        const failureUrl = `${baseFrontEndUrl}/checkoutStatus/${order.id}?status=failure`
        const [items, dataUser] = await Promise.all([
            createItemsCart(userId),
            getDataById(userId),
        ])
        const expireDatePreference = expirePreference()
        const pref = await createPreference({
            body:
            {
                external_reference: order.id,
                notification_url: notificationUrl,
                items: items,
                payer: {
                    name: dataUser.userName,
                    email: dataUser.email,
                    phone: {
                        number: dataUser.phoneNumber.toString()
                    }
                },
                back_urls: {
                    success: successUrl,
                    failure: failureUrl,
                    pending: pendingUrl
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDatePreference,
            }
        })
        const orderUrl = pref.init_point
        await Promise.all([
            await Order.setOrderIdAndUrl(userId, order.id, orderUrl),
            await resetCart(userId)
        ])
        return {
            url: orderUrl
        }
    } catch (error) {
        console.error("No se pudo crear la orden: ", error.message)
        throw error
    }
}

export async function deleteOrderById(userId: string, orderId: string): Promise<boolean> {
    try {
        const deleteDocumentById = await Order.deleteOrder(userId, orderId)
        return deleteDocumentById
    } catch (error) {
        console.error("no se pudo eliminar el documento:", error.message)
        throw error
    }
}

export async function handlePaidMerchantOrder(userIdDB: string, topic: string, id: String): Promise<OrderData> {
    if (topic !== "merchant_order") return null
    try {
        const { order_status, external_reference: orderId } = await getMerchantOrderId({ merchantOrderId: id as string })
        if (order_status !== "paid") return
        const myOrder = await Order.updateStatusOrder(userIdDB, orderId)
        const { userId, totalPrice } = myOrder.data
        const user = await getDataById(userId)
        const { email, userName } = user
        await Promise.all([
            purchaseAlert(email, userName, orderId),
            saleAlert(userId, orderId, totalPrice),
            resetCart(userId),
        ])
        return myOrder.data
    } catch (error) {
        console.error("No se pudo obtener el estado de la orden: ", error.message)
        throw error
    }
}

export async function getPreferenceById(id: string) {
    try {
        const response = await getPreference({ preferenceId: id })
        if (response) {
            return response
        }
        throw new Error(`No se pudo obtener los datos de la preferencia ${id}`)
    } catch (error) {
        console.error("No se pudo obtener la preferencia", error.message)
        return []
    }
}

export async function getPaymentById(userId: string, id: string) {
    try {
        const data = await getPayment({ id: id })
        if (!data) {
            throw new Error(`No se pudo obtener los datos del pago id:${id}`)
        }
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
        const updateOrder = await Order.updatePaymentOrder(userId, orderId, paymentData)
        return updateOrder
    } catch (error) {
        console.error("No se pudo obtener el pago", error.message)
        throw error
    }
}

