import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { saveProductsAlgolia } from "controllers/products"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await saveProductsAlgolia()
        res.status(200).send({ message: "Base de datos sincronizada" })
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data", error: error })
    }

}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)