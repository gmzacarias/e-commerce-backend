import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { parse } from "cookie"
import { verifyToken, generateToken } from "services/jwt"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
        const refreshToken = cookies.refresh_token
        if (!refreshToken) {
            throw new Error("no hay refresh token")
        }
        let payload: { userId: string }
        try {
            payload = verifyToken(refreshToken) as { userId: string }
        } catch (err) {
            throw new Error("refresh token inválido o expirado")
        }
        const newToken = generateToken({ userId: payload.userId })
        return res.status(200).send({
            message: "Nuevo token generado",
            token: newToken,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido"
        const status = message.includes("token") ? 401 : 500
        res.status(status).json({ message })
    }
}

const handler = method({ post: postHandler })

export default handlerCORS(handler)
