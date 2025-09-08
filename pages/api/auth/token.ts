import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { signIn } from "controllers/auth"
import { validateAuthToken } from "services/validators"
import { serialize } from "cookie"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const tokenSchema = validateAuthToken(req.body)
        const { email, code } = tokenSchema
        const { token, refreshToken } = await signIn(email, code)
        res.setHeader("Set-Cookie", serialize("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        }))
        res.status(200).send({ message: "inicio de sesion correcto", token: token })
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)