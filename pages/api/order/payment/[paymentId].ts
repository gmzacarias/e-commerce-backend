import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getPaymentById } from "controllers/order"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    const paymentId = req.query.paymentId as string
    try {
        if (!token) {
            res.status(401).send({ message: "No hay token" })
        }
        const paymentData = await getPaymentById(token.userId, paymentId)
        res.status(200).send({ data: paymentData })
    } catch (error) {
        if (error.message) {
            res.status(400).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

const handler = method({
    get: getHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)


