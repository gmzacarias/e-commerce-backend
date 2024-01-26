import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { searchProductById } from "controllers/products"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    const { productId } = req.query as any
    try {
        const product = await searchProductById(productId, res)
        res.status(200).send({ message: product })
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data" })
    }
}

const handler = method({
    get: getHandler
})

export default handler