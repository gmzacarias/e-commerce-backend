import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { parse, serialize } from "cookie"
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
        res.setHeader("Set-Cookie", serialize("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        }))

        return res.status(200).send({
            message: "Nuevo token generado",
            token: newToken,
        })
    } catch (error) {
        console.error("Error en refreshToken:", error)
        const message = error instanceof Error ? error.message : "Error desconocido"
        const status =
            message.includes("inválido") || message.includes("expirado") || message.includes("no hay refresh")
                ? 401
                : 500
        return res.status(status).json({ message })
    }
}

const handler = method({ post: postHandler })

export default handlerCORS(handler)
