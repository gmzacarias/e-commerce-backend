import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getMyOrders } from "controllers/order"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token) {
    try {
        if (!token) {
            res.status(401).send({ message: "No hay token" })
        } else {
            const ordersUser = await getMyOrders(token.userId)
            res.status(200).send({ data: ordersUser })
        }
    } catch (error) {
        res.status(400).send({ message: "Error al obtener las ordenes", error: error })
    }
}

const handler = method({
    get: getHandler,
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)