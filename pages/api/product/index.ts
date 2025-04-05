import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { GetMoreExpensiveProducts} from "services/algolia"


async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await GetMoreExpensiveProducts()
        res.status(200).send(response)
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