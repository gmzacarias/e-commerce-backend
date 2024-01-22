import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { signIn } from "controllers/auth"
import { validateBodyAuthToken } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await validateBodyAuthToken(req, res)
        const { email, code } = req.body
        const token = await signIn(email, code)
        if (!token) {
            res.status(401).send({ message: "Acceso no autorizado" })
        } else {
            res.status(200).send({ message: "inicio de sesion correcto" })
        }
    } catch (error) {
        res.status(500).send({ message: "Error interno del servidor", error: error })
    }
}

const handler = method({
    post: postHandler
})

export default handler