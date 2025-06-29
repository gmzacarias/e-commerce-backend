import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { saveProductsAlgolia } from "services/algolia"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await saveProductsAlgolia()
        res.status(200).send({ message: "Base de datos sincronizada" })
    } catch (error) {
        if (error.message) {
            res.status(400).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }

}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)