import { jwt, secret } from "lib/jwt"

export function generateToken(data: string | object | Buffer): string {
    try {
        if (!data || !secret) {
            throw new Error("faltan parametros para poder generar el token")
        }
        const token = jwt.sign(data, secret, { expiresIn: "15m" })
        return token
    } catch (error) {
        console.error("Error en JWT:", error.message)
        throw error
    }
}

export function generateRefreshToken(data: string | object | Buffer): string {
    try {
        if (!data || !secret) {
            throw new Error("faltan parametros para poder generar el token")
        }
        const refreshToken = jwt.sign(data, secret, { expiresIn: "7d" })
        return refreshToken
    } catch (error) {
        console.error("Error en JWT:", error.message)
        throw error
    }
}
export function verifyToken(token: string): string | jwt.JwtPayload {
    try {
        if (!token || !secret) {
            throw new Error("faltan parametros para poder verificar el token")
        }
        const verify = jwt.verify(token, secret)
        return verify
    } catch (error) {
        console.error("Error en JWT:", error.message)
        throw error
    }
}