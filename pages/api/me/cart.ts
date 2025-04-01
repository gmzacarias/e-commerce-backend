import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { addProductCartById, deleteProductCartById, getCartById, resetCart, updateData } from "controllers/user"
import { validateBodyProduct, validateQueryProduct } from "lib/schemaMiddleware"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token: { userId: string }) {
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        const cart = await getCartById(token.userId)
        if (cart.length < 1) {
            res.status(200).send({ message: "El carrito esta vacio" })
        }
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
    const { productId } = req.query as any
    const { quantity } = req.body as any
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        await validateQueryProduct(req, res)
        await validateBodyProduct(req, res)
        const addItem = await addProductCartById(token.userId, productId, quantity)
        if (!addItem) {
            throw new Error(`el producto id ${productId} no se encontro en la base de datos`)
        }
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
    const { productId } = req.query as any
    try {
        if (!token) {
            throw new Error("no hay token")
        }
        await validateQueryProduct(req, res)
        const deleteItem = await deleteProductCartById(token.userId, productId)
        if (!deleteItem) {
            throw new Error(`el producto id ${productId} no pudo ser eliminado de la base de datos`)
        }
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
        if (!token) {
            throw new Error("no hay token")
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