import type { NextApiRequest, NextApiResponse } from "next"
import { decode } from "lib/jwt"
import parseToken from "parse-bearer-token"

export function authMiddleware(callback) {
    return function (req: NextApiRequest, res: NextApiResponse) {
        const token = parseToken(req)
        if (!token) {
            res.status(401).send({ message: "No hay token" })
        }
        try {
            const decodedToken = decode(token)
            console.log(decodedToken)
            if (decodedToken) {
                callback(req, res, decodedToken)
            } else {
                res.status(401).send({ message: "Token incorrecto" })
            }
        } catch (error) {
            console.error("no se pudo verificar el token")
        }
    }
}