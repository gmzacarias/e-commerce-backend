import { Order } from "models/order"
import { getDataById, resetCart } from "controllers/user"
import { createPreference, getMerchantOrderId, getPreference, getPayment } from "services/mercadopago"
import { getDate } from "utils/getDate"
import { createItemsCart, getCartTotalPrice, prepareProductsToCart } from "services/cart"
import { purchaseAlert, saleAlert } from "services/sendgrid"
import { getNgrokUrl } from "services/ngrok"

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
            created: getDate()
        })
        const currentNgrokUrl = await getNgrokUrl()
        let notificationUrl: string
        let successUrl: string
        let pendingUrl: string
        let failureUrl: string

        if (process.env.NODE_ENV == "development") {
            notificationUrl = `${currentNgrokUrl}/api/ipn/mercadopago`;
            successUrl = `http://localhost:3000/checkoutStatus/${order.id}?status=success`;
            pendingUrl = `http://localhost:3000/checkoutStatus/${order.id}?status=pending`;
            failureUrl = `http://localhost:3000/checkoutStatus/${order.id}?status=failure`;
        } else if (process.env.NODE_ENV == "production") {
            notificationUrl = "https://e-commerce-backend-lake.vercel.app/api/ipn/mercadopago";
            successUrl = `https://e-commerce-smartshop.vercel.app/checkoutStatus/${order.id}?status=success`;
            pendingUrl = `https://e-commerce-smartshop.vercel.app/checkoutStatus/${order.id}?status=pending`;
            failureUrl = `https://e-commerce-smartshop.vercel.app/checkoutStatus/${order.id}?status=failure`;
        }
        const [items, dataUser] = await Promise.all([
            createItemsCart(userId),
            getDataById(userId),
        ])
        const pref = await createPreference({
            body:
            {
                external_reference: order.id,
                notification_url: notificationUrl,
                items: items,
                payer: {
                    "name": dataUser.userName,
                    "email": dataUser.email,
                    "phone": {
                        "number": dataUser.phoneNumber.toString()
                    }
                },
                back_urls: {
                    success: successUrl,
                    pending: pendingUrl,
                    failure: failureUrl
                },
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
            }
        })

        const orderUrl = pref.init_point
        await Order.setOrderIdAndUrl(userId, order.id, orderUrl)
        await resetCart(userId)

        return {
            url: pref.init_point

        }
    } catch (error) {
        console.error("No se pudo crear la preferencia: ", error.message)
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
        const { order_status, external_reference } = await getMerchantOrderId({ merchantOrderId: id as string })
        if (order_status !== "paid") return
        const myOrder = await Order.updateStatusOrder(userIdDB, external_reference)
        const { userId, totalPrice } = myOrder.data
        const user = await getDataById(userId)
        const { email, userName } = user
        await Promise.all([
            purchaseAlert(email, userName, external_reference),
            saleAlert(userId, external_reference, totalPrice),
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

export async function getPaymentById(id: string) {
    try {
        const response = await getPayment({ id: id })
        if (response) {
            return response
        }
        throw new Error(`No se pudo obtener los datos del pago id:${id}`)
    } catch (error) {
        console.error("No se pudo obtener el pago", error.message)
        return []
    }
}

