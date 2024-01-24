import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { authMiddleware } from "lib/middleware"
import { getDataById } from "controllers/user"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token) {
    try {
        if (!token) {
            res.status(401).send({ message: "No hay token"})
        }else {
            const dataUser = await getDataById(token.userId)
            res.status(200).send({ data:dataUser })
        }
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data", error: error })
    }
}

const handler = method({
    get: getHandler
})

export default authMiddleware(handler)