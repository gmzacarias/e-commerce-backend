import { Order } from "models/order"
import { createPreference } from "lib/mercadopago"


type CreateOrderRes = {
    url: string
}

const products = {
    1234: {
        "title": "",
        "price": 10,

    }
}

export async function createOrder(userId: string, productId: string, additionalInfo): Promise<CreateOrderRes> {
    const product = products[productId]
    if (!product) {
        throw "El producto no existe"
    }

    const order = await Order.createNewOrder({
        additionalInfo,
        productId,
        userId: userId,
        status: "pending",
    })

    const pref = await createPreference({
        body:
        {
            external_reference: order.id,
            notification_url: "https://flujos-de-pago.vercel.app/api/ipn/mercadopago",
            // notification_url:"https://webhook.site/dd8f3342-dfa2-4b32-bde9-ced10ce01539",
            items: [
                {
                    title: product.title,
                    description: "remera oversize",
                    picture_url: "http://www.myapp.com/myimage.jpg",
                    category_id: "car_electronics",
                    quantity: 1,
                    currency_id: "ARS",
                    unit_price: product.price
                }
            ], payer: {
                phone: {
                    number: null
                },
                identification: {},
                address: {
                    street_number: null
                }
            },
            back_urls: {
                success: "http://apx.school",
                pending: "http://vercel.com",
                failure: "http://github.com"
            },
            additional_info: "",
        }
    })
    return {
        url:pref.init_point
    }
}
