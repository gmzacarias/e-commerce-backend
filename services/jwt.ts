import { jwt, secret } from "lib/jwt"

export function generate(data: string | object | Buffer) {
    try {
        const token = jwt.sign(data, secret);
        return token
    } catch (error) {
        console.error("Error en JWT:", error.message)
        throw error
    }
}

export function decode(token: string) {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded
    } catch (error) {
        console.error("Error en JWT:", error.message)
        throw error
    }
}