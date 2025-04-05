import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { handlePaidMerchantOrder } from "controllers/order"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    const topic = req.query.topic as string
    const id = req.query.id as string
    try {
        await handlePaidMerchantOrder(topic, id)
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

export default handlerCORS(handler)