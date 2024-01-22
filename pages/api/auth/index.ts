import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { sendCode } from "controllers/auth"
import { validateBodyAuth } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await validateBodyAuth(req, res)
        const { email } = req.body
        await sendCode(email)
        res.status(200).send({ message: "Codigo Enviado" })
    } catch (error) {
        res.status(400).send({ message: "Error al enviar el codigo", error: error })
    }
}

const handler = method({
    post: postHandler
})

export default handler
