import type { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "lib/middleware"
import method from "micro-method-router"

import { getMyOrdersById } from "controllers/order"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    const { orderId } = req.query as any
    try {
        // console.log(orderId)
        const orderFound = await getMyOrdersById(orderId)
        res.status(200).send({ message: orderFound })
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data" })
    }
}

const handler = method({
    get: getHandler
})

export default authMiddleware(handler)