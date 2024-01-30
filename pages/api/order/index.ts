import type { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "lib/middleware"
import { createOrder } from "controllers/order"
import method from "micro-method-router"
import { validateBodyCreateOrder, validateQueryCreateOrder } from "lib/schemaMiddleware"


async function postHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { productId } = req.query as any
    const { additionalInfo } = req.body
    try {
        // console.log(productId)
        // console.log(additionalInfo)
        await validateQueryCreateOrder(req, res)
        await validateBodyCreateOrder(req, res)
        const response = await createOrder(token.userId, additionalInfo)
        res.send({ message: response })
    } catch (error) {
        res.status(400).send({ message: error })
    }
}

const handler = method({
    post: postHandler
})

export default authMiddleware(handler)


