import { Order } from "models/order"
import { getDataById, getCartById } from "controllers/user"
import { createPreference } from "lib/mercadopago"
import { searchProductById } from "./products"
import { object } from "yup"


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
    const productsIds = dataCart.map(id => {
        return {
            id: id.objectID
        }
    })
    return productsIds
}

async function getProductsCart(userId: string) {
    const dataCart = await getCartById(userId)
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
}

export async function createOrder(userId: string, additionalInfo: string): Promise<CreateOrderRes> {
    const items = await getProductsCart(userId)
    if (!items) {
        throw new Error("El producto no existe")
    }
    try {
        const dataUser = await getDataById(userId)
        const productIds = await getProductsIds(userId)
        const order = await Order.createNewOrder({
            userId: userId,
            products: productIds,
            status: "pending",
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