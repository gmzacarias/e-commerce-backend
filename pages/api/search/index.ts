import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { searchProductsByQuery } from "services/algolia"
import { validateSearchByQuery} from "services/validators"

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const result = validateSearchByQuery(req.query as object as QueryData)
        const response = await searchProductsByQuery(result as object as QueryData)
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