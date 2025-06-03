import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getMyUser, updateData } from "controllers/user"
import { validateUserUpdate } from "services/validators"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        const userData = await getMyUser(token.userId)
        if (!userData) {
            throw new Error("no se encontro el usuario")
        }
        res.status(200).send({ data: userData })
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

async function patchHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        const userSchema = validateUserUpdate(req.body)
        await updateData(token.userId, userSchema as UserData)
        res.status(200).send({ message: "Datos actualizados" })

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
    patch: patchHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)