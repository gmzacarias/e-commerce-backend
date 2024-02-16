import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getOrderDataById } from "controllers/order"
import { validateQueryFindOrder } from "lib/schemaMiddleware"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    const { orderId } = req.query as any
    try {
        // console.log("endpoint", orderId)
        await validateQueryFindOrder(req, res)
        const orderFound = await getOrderDataById(orderId)
        res.status(200).send({ message: orderFound })
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data" })
    }
}

const handler = method({
    get: getHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)