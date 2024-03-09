import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router" 
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { createOrder } from "controllers/order"
import { validateBodyCreateOrder } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { additionalInfo } = req.body
    try {
        // console.log(additionalInfo)
        await validateBodyCreateOrder(req, res)
        const response = await createOrder(token.userId, additionalInfo)
        res.send({ url: response })
    } catch (error) {
        res.status(400).send({ message: error })
    }
}

const handler = method({
    post: postHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)


