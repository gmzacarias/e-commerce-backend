import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getDataById, updateData } from "controllers/user"
import { validatePatchData } from "lib/schemaMiddleware"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        const dataUser = await getDataById(token.userId)
        if (!dataUser) {
            throw new Error("no se encontro el usuario")
        }
        res.status(200).send({ data: dataUser })
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

async function putHandler(req: NextApiRequest, res: NextApiResponse,token: { userId: string }) {
    const data = req.body
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        await validatePatchData(req, res)
        if (data.email || data.userName || data.phoneNumber || data.address) {
            await updateData(token.userId, data)
            res.status(200).send({ message: "Datos actualizados" })
        }
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

const handler = method({
    get: getHandler,
    put: putHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)