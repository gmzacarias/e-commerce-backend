import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { sendCode } from "controllers/auth"
import { validateAuth } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await validateAuth(req, res)
        const { email } = req.body
        await sendCode(email)
        return res.status(200).send({ message: "Codigo Enviado" })
    } catch (error) {
        return res.status(400).send({ message: "Error al enviar el codigo", error: error })
    }
}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)