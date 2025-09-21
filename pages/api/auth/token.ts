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
        const message = error instanceof Error ? error.message : "Error desconocido"
        const status = message.includes("token") ? 401 : 500
        res.status(status).json({ message })
    }
}

const handler = method({
    post: postHandler
})

export default handlerCORS(handler)