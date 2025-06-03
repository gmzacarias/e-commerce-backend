import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { setPaymentOrder, updateStatusOrder } from "controllers/order"
import { authMiddleware } from "lib/middleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        await updateStatusOrder(token.userId, req.query.topic as string, req.query.id as string)
        res.status(200).send({ message: "Compra exitosa" })
    } catch (error) {
        if (error.message) {
            res.status(400).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

const handler = method({
    post: postHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)