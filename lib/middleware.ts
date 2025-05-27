import type { NextApiRequest, NextApiResponse } from "next"
import parseToken from "parse-bearer-token"
import { decodeToken } from "services/jwt"

export function authMiddleware(callback: (arg0: NextApiRequest, arg1: NextApiResponse, arg2: any) => void) {
    return function (req: NextApiRequest, res: NextApiResponse) {
        const token = parseToken(req)
        if (!token) {
            res.status(401).send({ message: "No hay token" })
        }
        try {
            const decodedToken = decodeToken(token)
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