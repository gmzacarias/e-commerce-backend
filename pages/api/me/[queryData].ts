import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { updateSpecifiedData } from "controllers/user"
import { validatePatchData, validatePatchSpecifiedData } from "lib/schemaMiddleware"


async function patchHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    const { queryData } = req.query as any
    const data = req.body as any
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        await validatePatchSpecifiedData(queryData, res)
        await validatePatchData(req, res)
        const dataKeys = Object.keys(data).toString();
        if (queryData !== dataKeys) {
            throw `No se permite actualizar el dato: ${queryData}`;
        } else if (data.email || data.userName || data.phoneNumber || data.address) {
            const dataUser = await updateSpecifiedData(token.userId, data)
            res.status(200).send({ data: dataUser })
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
    patch: patchHandler
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)