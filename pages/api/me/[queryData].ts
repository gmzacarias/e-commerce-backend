import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { authMiddleware } from "lib/middleware"
import { updateSpecifiedData } from "controllers/user"
import { validatePatchData, validatePatchSpecifiedData } from "lib/schemaMiddleware"


async function patchHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { queryData } = req.query as any
    const data = req.body as any
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            await validatePatchSpecifiedData(queryData,res)
            await validatePatchData(req, res)
            const dataKeys = Object.keys(data).toString();
            if (queryData !== dataKeys) {
                throw `No se permite actualizar el dato: ${queryData}`;
            } else if (data.email || data.userName || data.phoneNumber || data.address) {
                const dataUser = await updateSpecifiedData(token.userId, data)
                res.status(200).send({ data: dataUser })
            }
        } catch (error) {
            res.status(400).send({ message: "Error al obtener la data", error: error })
        }
    }
}

const handler = method({
    patch: patchHandler
})

export default authMiddleware(handler)