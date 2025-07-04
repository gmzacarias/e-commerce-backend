import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { sendCode } from "controllers/auth"
import { validateAuth } from "services/validators"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const authSchema = validateAuth(req.body)
        const { email } = authSchema
        await sendCode(email)
        return res.status(200).send({ message: "Codigo Enviado" })
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