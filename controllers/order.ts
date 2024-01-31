import { Order } from "models/order"
import { getDataById, getCartById } from "controllers/user"
import { createPreference, getMerchantOrderId } from "lib/mercadopago"
import { sendPaymentConfirmed, sendSaleConfirmed } from "lib/sendgrid"

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
                    title: product.Model,
                    description: `${product.Brand} ${product.Model}`,
                    picture_url: product.Photo,
                    category_id: "Phones",
                    quantity: 1,
                    currency_id: "ARS",
                    unit_price: product.Price
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
    const products = await getProductsCart(userId);
    if (products) {
        const totalPrice = products.reduce((total, product) => {
            return total + product.unit_price;
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
            additionalInfo
        })
        const pref = await createPreference({
            body:
            {
                external_reference: order.id,
                notification_url: "https://e-commerce-backend-lake.vercel.app/api/ipn/mercadopago",
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

export async function Hola(userId: string, orderId: string) {
    const order = await getOrderDataById(orderId)
    if (order) {
        try {
            const user = await getDataById(userId)
            const send = await purchaseAlert(user.email, user.userName, orderId)
            console.log("soy el user", user)
            return send
        } catch (error) {
            console.error("No se envio el alerta", error.message)
        }
    } else {
        return null
    }
}

export async function Venta(userId: string, orderId: string) {
    const order = await getOrderDataById(orderId) as any
    if (order) {
        try {
            const send = await saleAlert(userId, orderId, order.totalPrice)
            console.log("soy la venta", send)
            return send
        } catch (error) {
            console.error("No se envio el alerta", error.message)
        }
    } else {
        return null
    }
}



export async function updateStatusOrder(id: string | number) {
    const order = await getMerchantOrderId({ merchantOrderId: id as string | number })
    if (order.order_status === "paid") {
        try {
            const orderId = order.external_reference
            const myOrder = new Order(orderId)
            await myOrder.pull()
            const userId = myOrder.data.userId
            console.log(myOrder.data.status)
            await myOrder.push()
            console.log(myOrder.data.status)
            const user = await getDataById(userId)
            await purchaseAlert(user.email, user.userName, orderId)
            await saleAlert(userId, orderId, myOrder.data.totalPrice)
        } catch (error) {
            console.error("No se pudo obtener el estado de la orden: ", error.message)
        }
        return
    }
}