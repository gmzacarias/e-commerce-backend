import type { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "lib/middleware"
import { createOrder } from "controllers/order"
import method from "micro-method-router"
import * as yup from "yup"

let querySchema = yup.object({
    productId: yup.string().required(),
});

let bodySchema=yup
.object()
.shape({
    color:yup.string(),
    address:yup.string(),
})
//evita que me pasen datos adicionales
.noUnknown(true)

async function postHandler(req: NextApiRequest, res: NextApiResponse, token) {
    //chequeo req.query y req.body
    try {
        await querySchema.validate(req.query, { strict: true },)
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
    try {
        await bodySchema.validate(req.body, { strict: true },)
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }



    const { productId } = req.query as any
    try {
        const { url } = await createOrder(token.userId, productId, req.body)
        res.send({
            url,
        })
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


