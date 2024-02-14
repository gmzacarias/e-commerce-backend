import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { runMiddleware } from "lib/cors"
import { authMiddleware } from "lib/middleware"
import { getDataById, updateData } from "controllers/user"
import { validatePatchData } from "lib/schemaMiddleware"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token) {
    try {
        await runMiddleware(req, res);
        if (!token) {
            res.status(401).send({ message: "No hay token" })
        } else {
            const dataUser = await getDataById(token.userId)
            res.status(200).send({ data: dataUser })
        }
    } catch (error) {
        res.status(400).send({ message: "Error al obtener la data", error: error })
    }
}

async function patchHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const data = req.body
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            await validatePatchData(req, res)
            if (data.email || data.userName || data.phoneNumber||data.address) {
                await updateData(token.userId,data)
                res.status(200).send({ message: "Datos actualizados"})
            }
        } catch (error) {
            res.status(400).send({ message: "Error al obtener la data", error: error })
        }
    }
}

const handler = method({
    get: getHandler,
    patch: patchHandler
})

export default authMiddleware(handler)