import { createPreference, getMerchantOrderId, getPreference, getPayment } from "lib/mercadopago"
import { Order } from "models/order"
import { getDataById, resetCart } from "controllers/user"
import { getDate, getProductsCart, SaveProductsById, getTotalPrice, purchaseAlert, saleAlert } from "utils/orders"
import { PreferenceGetData } from "mercadopago/dist/clients/preference/get/types"
import { PaymentGetData } from 'mercadopago/dist/clients/payment/get/types';

type UrlType = {
    notification: string;
    success: string;
    pending: string;
    failure: string;
}

export async function getMyOrders(userId: string) {
    try {
        const orders = await Order.getOrders(userId)
        // console.log(orders)
        if (orders) {
            return orders
        } else {
            throw new Error("No se pudo obtener las ordenes")
        }
    } catch (error) {
        console.error("Ordenes del usuario", error.message)
        return null
    }
}

export async function getOrderDataById(orderId: string) {
    try {
        const order = await Order.getOrderById(orderId)
        // console.log(orders)
        if (order) {
            return order
        } else {
            throw new Error("No se pudo obtener las ordenes")
        }
    } catch (error) {
        console.error("Ordenes del usuario", error.message)
        return null
    }
}

export async function getOrderState(orderId: string) {
    try {
        const orders = await Order.getOrderById(orderId)
        // console.log(orders)
        if (orders) {
            return orders
        } else {
            throw new Error("No se pudo obtener las ordenes")
        }
    } catch (error) {
        console.error("Ordenes del usuario", error.message)
        return null
    }
}


export async function createOrder(userId:string,additionalInfo:string,){
    const items = await getProductsCart(userId)
    if (!items) {
        throw new Error("El producto no existe")
    }
    try {
        const dataUser = await getDataById(userId)
        const productIds = await SaveProductsById(userId)
        const totalPrice = await getTotalPrice(userId)
        const order = await Order.createNewOrder({
            id: "",
            userId: userId,
            products: productIds,
            status: "pending",
            totalPrice: totalPrice,
            url: "",
            additionalInfo,
            created: getDate()
        })
        
        let notificationUrl:string
        let successUrl: string
        let pendingUrl: string
        let failureUrl: string

        if (process.env.NODE_ENV == "development") {
            notificationUrl = "https://webhook.site/115e6d94-141f-43b2-965f-db6fd6e18264";
            successUrl = `http://localhost:3000/checkoutStatus/${order.id}?status=success`;
            pendingUrl = `http://localhost:3000/checkoutStatus/${order.id}?status=pending`;
            failureUrl = `http://localhost:3000/checkoutStatus/${order.id}?status=failure`;
        } else if (process.env.NODE_ENV == "production") {
            notificationUrl = "https://e-commerce-backend-lake.vercel.app/api/ipn/mercadopago";
            successUrl = `https://e-commerce-smartshop.vercel.app/checkoutStatus/${order.id}?status=success`;
            pendingUrl = `https://e-commerce-smartshop.vercel.app/checkoutStatus/${order.id}?status=pending`;
            failureUrl = `https://e-commerce-smartshop.vercel.app/checkoutStatus/${order.id}?status=failure`;
        }

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
        const setUrl = await Order.setOrderIdAndUrl(order.id, orderUrl)
        // console.log("newUrl", setUrl)
        await resetCart(userId)

        return {
            url: pref.init_point
            
        }
    } catch (error) {
        console.error("No se pudo crear la preferencia: ", error.message)
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



export async function updateStatusOrder(topic: string, id: String) {
    if (topic === "merchant_order") {
        const order = await getMerchantOrderId({ merchantOrderId: id as string })
        // console.log("order", order.order_status)
        // console.log("status", order.order_status === "paid")
        const orderStatus = order.order_status
        if (orderStatus === "paid") {
            try {
                const orderId = order.external_reference
                const myOrder = new Order(orderId)
                await myOrder.pull()
                const userId = myOrder.data.userId
                // console.log(myOrder.data.status)
                myOrder.data.status = "closed"
                await myOrder.push()
                // console.log(myOrder.data.status)
                const user = await getDataById(userId)
                await purchaseAlert(user.email, user.userName, orderId)
                await saleAlert(userId, orderId, myOrder.data.totalPrice)
                await resetCart(userId)
                return myOrder.data
            } catch (error) {
                console.error("No se pudo obtener el estado de la orden: ", error.message)
            }
            return
        }
    }
}