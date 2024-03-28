import { Order } from "models/order"
import { createPreference, getMerchantOrderId } from "lib/mercadopago"
import { sendPaymentConfirmed, sendSaleConfirmed } from "lib/sendgrid"
import { getDataById, getCartById, resetCart } from "controllers/user"

if (process.env.NODE_ENV == "development") {
    var notificationUrl = "https://webhook.site/115e6d94-141f-43b2-965f-db6fd6e18264";

} else if (process.env.NODE_ENV == "production") {
    var notificationUrl = "https://e-commerce-backend-lake.vercel.app/api/ipn/mercadopago";
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

type CreateOrderRes = {
    url: string
}

async function getProductsIds(userId: string) {
    const dataCart = await getCartById(userId)
    if (dataCart) {
        try {
            const productsIds = dataCart.map(id => {
                return {
                    id: id.objectID
                }
            })
            return productsIds
        } catch (error) {
            console.error("No se encontraron datos en el carrito ", error.message)
        }
    } else {
        return null
    }
}

async function getProductsCart(userId: string) {
    const dataCart = await getCartById(userId)
    if (dataCart) {
        try {
            const mapProducts = dataCart.map(product => {
                return {
                    title: product.model,
                    description: `${product.brand} ${product.model}`,
                    picture_url: product.photo,
                    category_id: "Phones",
                    quantity: product.quantity,
                    currency_id: "ARS",
                    unit_price: product.price
                };
            });
            return mapProducts
        } catch (error) {
            console.error("No se encontraron datos en el carrito ", error.message)
        }
    } else {
        return null
    }
}

async function getTotalPrice(userId: string) {
    const products = await getCartById(userId);
    if (products) {
        const totalPrice = products.reduce((total, product) => {
            return total + product.totalPrice;
        }, 0);
        console.log(totalPrice)
        return totalPrice;
    } else {
        return null
    }
}

export async function createOrder(userId: string, additionalInfo: string): Promise<CreateOrderRes> {
    const items = await getProductsCart(userId)
    if (!items) {
        throw new Error("El producto no existe")
    }
    try {
        const dataUser = await getDataById(userId)
        const productIds = await getProductsIds(userId)
        const totalPrice = await getTotalPrice(userId)
        const order = await Order.createNewOrder({
            userId: userId,
            products: productIds,
            status: "pending",
            totalPrice: totalPrice,
            url: "",
            additionalInfo
        })
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
                        number: dataUser.phoneNumber
                    }
                },
                back_urls: {
                    success: "http://apx.school",
                    pending: "http://vercel.com",
                    failure: "http://github.com"
                },
                auto_return: "all",
                additional_info: additionalInfo,
            }
        })

        const orderUrl = pref.init_point
        const setUrl = await Order.setOrderUrl(order.id, orderUrl)
        console.log("newUrl", setUrl)


        return {
            url: pref.init_point
        }
    } catch (error) {
        console.error("No se pudo crear la preferencia: ", error.message)
    }
}

async function purchaseAlert(email: string, userName: string, order: string) {
    try {
        const data = await sendPaymentConfirmed(email, userName, order)
        return data
    } catch (error) {
        console.error("No se pudo enviar el mail ", error.message)
    }
}

async function saleAlert(userId: string, order: string, price: number) {
    try {
        const data = await sendSaleConfirmed(userId, order, price)
        return data
    } catch (error) {
        console.error("No se pudo enviar el mail ", error.message)
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