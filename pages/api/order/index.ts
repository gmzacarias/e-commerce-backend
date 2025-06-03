import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { createOrder } from "controllers/order"
import { validateCreateOrder } from "services/validators"

async function postHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        const orderSchema = validateCreateOrder(req.body.additionalInfo as string)
        const dataUrl = await createOrder(token.userId, orderSchema)
        res.status(200).send(dataUrl)
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


