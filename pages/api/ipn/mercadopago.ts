import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { handlePaidMerchantOrder } from "controllers/order"
import { authMiddleware } from "lib/middleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse,token:{userId:string}) {
    const topic = req.query.topic as string
    const id = req.query.id as string
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        await handlePaidMerchantOrder(token.userId,topic, id)
        res.send({ message: "Compra exitosa" })
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