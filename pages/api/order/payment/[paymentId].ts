import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getPaymentById } from "controllers/order"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    const paymentId = req.query.paymentId as string
    try {
        const response = await getPaymentById(paymentId)
        res.status(200).send({ data: response })
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

export default handlerCORS(handler)


