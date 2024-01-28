import { Order } from "models/order"
import { createPreference } from "lib/mercadopago"
import { productIndex } from "lib/algolia"
import { cleanResults, searchProductById } from "./products"

type CreateOrderRes = {
    url: string
}

export async function createOrder(userId: string, productId: string, additionalInfo: string): Promise<CreateOrderRes> {
    const product = await searchProductById(productId)
    if (!product) {
        throw new Error("El producto no existe")
    }
    try {
        const order = await Order.createNewOrder({
            userId: userId,
            productId,
            status: "pending",
            additionalInfo
        })
        console.log(order.data)
        const pref = await createPreference({
            body:
            {
                external_reference: order.id,
                // notification_url: "https://flujos-de-pago.vercel.app/api/ipn/mercadopago",
                notification_url: "https://webhook.site/115e6d94-141f-43b2-965f-db6fd6e18264",
                items: [
                    {
                        title: product.Model,
                        description: "remera oversize",
                        picture_url: product.Photo,
                        category_id: "smartPhones",
                        quantity: 1,
                        currency_id: "ARS",
                        unit_price: product.Price
                    }
                ],
                back_urls: {
                    success: "http://apx.school",
                    pending: "http://vercel.com",
                    failure: "http://github.com"
                },
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
