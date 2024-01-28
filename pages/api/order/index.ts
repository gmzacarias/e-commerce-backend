import type { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "lib/middleware"
import { createOrder } from "controllers/order"
import method from "micro-method-router"


async function postHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { productId } = req.query as any
    const {additionalInfo} = req.body
    try {
        console.log(productId)
        const response = await createOrder(token.userId, productId, additionalInfo)
        res.send({ message: response })
    } catch (error) {
        res.status(400).send({ message: error })
    }
}

const handler = method({
    post: postHandler
})

//desafio hacerlo en los middlewares asi no hay tanta logica aca
// const posthandlerValidation= schemamiddleware(bodySchema,postHandler)

// const handler2= method({
//     post:posthandlerValidation
// })

export default authMiddleware(handler)


