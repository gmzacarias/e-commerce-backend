import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { validateQuerySearchProductId } from "lib/schemaMiddleware"
import { searchProductById } from "services/algolia"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    const productId = req.query.productId as string
    try {
        await validateQuerySearchProductId(req, res)
        const product = await searchProductById(productId)
        res.status(200).send(product)
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