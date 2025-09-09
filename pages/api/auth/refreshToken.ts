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
        if (error instanceof Error && error.message.includes("token")) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error en refresh token", error: error })
        }
    }
}

const handler = method({ post: postHandler })

export default handlerCORS(handler)
