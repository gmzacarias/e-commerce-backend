import type { NextApiRequest, NextApiResponse } from "next"
import { getMerchantOrderId } from "lib/mercadopago"
import { Order } from "models/order"

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const { id, topic } = req.query
    if (topic === "merchant_order") {
        const order = await getMerchantOrderId({ merchantOrderId: id as string | number })
        // console.log(orderStatus)
        if (order.order_status === "paid") {
            const orderId = order.external_reference
            const myOrder = new Order(orderId)
            await myOrder.pull()
            // console.log(myOrder.data.status)
            myOrder.data.status = "closed"
            await myOrder.push()
            //send email tu pago fue confirmado
            //sendemail interno, alguien compro algo
            // console.log("todo bien?")
        }
    }
    res.send({ message: "compra aprobada" })
}
