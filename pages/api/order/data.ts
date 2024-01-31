import type { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "lib/middleware"
import { Hola, Venta } from "controllers/order"
import method from "micro-method-router"
import { validateBodyCreateOrder } from "lib/schemaMiddleware"


async function getHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { query } = req.query as any
    try {
        console.log(query)
        // const response = await Hola(token.userId, query)
        const response = await Venta(token.userId, query)
        res.send({ message: response })
    } catch (error) {
        res.status(400).send({ message: error })
    }
}

const handler = method({
    get: getHandler
})

export default authMiddleware(handler)
