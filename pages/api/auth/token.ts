import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { signIn } from "controllers/auth"
import { validateAuthToken } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await validateAuthToken(req, res)
        const { email, code } = req.body
        const token = await signIn(email, code)
        if (!token) {
            res.status(401).send({ message: "Acceso no autorizado",token: token })
        } else {
            res.status(200).send({ message: "inicio de sesion correcto", token: token })
        }
    } catch (error) {
        res.status(500).send({ message: "Error interno del servidor", error: error })
    }
}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)