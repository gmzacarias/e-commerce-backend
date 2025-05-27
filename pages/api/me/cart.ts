import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { getMyCart, addProductById, deleteProductById, resetCart } from "controllers/cart"
import { validateCartBody, validateCartQuery } from "services/validators"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        const cart = await getMyCart(token.userId)
        res.status(200).send(cart)
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        console.log("product", req.query.productId)
        const productId = validateCartQuery(req.query.productId as string)
        const quantity = validateCartBody(req.body.quantity as number)
        console.log(productId)
        await addProductById(token.userId, productId, quantity)
        res.status(200).send({ message: `el producto id ${productId} fue agregado` })
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
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
        const productId = validateCartQuery(req.query.productId as string)
        await deleteProductById(token.userId, productId)
        res.status(200).send({ message: `el producto id ${productId} fue eliminado` })
    } catch (error) {
        if (error.message) {
            res.status(401).send({ message: error.message })
        } else {
            res.status(500).send({ message: "Error interno del servidor", error: error })
        }
    }
}


async function putHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token.userId) {
            throw new Error("token invalido o no autorizado")
        }
        await resetCart(token.userId)
        res.status(200).send({ message: "El carrito esta vacio" })
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
    post: postHandler,
    put: putHandler,
    delete: deleteHandler,
})

const authHandler = authMiddleware(handler)

export default handlerCORS(authHandler)