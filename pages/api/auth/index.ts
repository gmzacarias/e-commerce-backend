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
          const message = error instanceof Error ? error.message : "Error desconocido"
        const status = message.includes("Email") ? 400 : 500
        res.status(status).json({ message })
    }
}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)