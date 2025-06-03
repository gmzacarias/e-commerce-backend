import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { deleteOrder, getOrderDataById } from "controllers/order"
import { validateOrderId } from "services/validators"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        const orderId = validateOrderId(req.query.orderId as string)
        const orderFound = await getOrderDataById(token.userId, orderId)
        res.status(200).send({ data: orderFound })
    } catch (error) {
        if (error.message) {
            res.status(400).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        const orderId = validateOrderId(req.query.orderId as string)
        const deleteDocumentOrder = await deleteOrder(token.userId, orderId)
        res.status(200).send({ message: `orden ${orderId} eliminada correctamente`, delete: deleteDocumentOrder })
    } catch (error) {
        if (error.message) {
            res.status(400).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

const handler = method({
    get: getHandler,
    delete: deleteHandler,
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)