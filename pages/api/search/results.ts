import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { productos, searchProducts } from "controllers/products"
import { validateSearchProduct } from "lib/schemaMiddleware"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await productos(req, res)
        res.status(200).send({ message: response })
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data", error: error })
    }
}

const handler = method({
    get: getHandler
})

export default handler