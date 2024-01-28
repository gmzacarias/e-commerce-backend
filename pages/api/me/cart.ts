import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { authMiddleware } from "lib/middleware"
import { validateQueryProduct } from "lib/schemaMiddleware"
import { addProductCartById, deleteProductCartById, getCartById, resetCart, updateData } from "controllers/user"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token) {
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            const cart = await getCartById(token.userId)
            res.status(200).send({ message: { cart } })

        } catch (error) {
            res.status(400).send({ message: "Error al obtener la data", error: error })
        }
    }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { productId } = req.query as any
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            await validateQueryProduct(req,res)
            const cart = await addProductCartById(token.userId, productId)
            res.status(200).send({ message: { cart } })

        } catch (error) {
            res.status(400).send({ message: "Error al agregar la data", error: error })
        }
    }
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { productId } = req.query as any
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            await validateQueryProduct(req,res)
            await deleteProductCartById(token.userId, productId)
            res.status(200).send({ message: `el producto id ${productId} fue eliminado` })

        } catch (error) {
            res.status(400).send({ message: "Error al agregar la data", error: error })
        }
    }
}

async function putHandler(req: NextApiRequest, res: NextApiResponse, token) {
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            await resetCart(token.userId)
            res.status(200).send({ message: "el carrito esta vacio" })

        } catch (error) {
            res.status(400).send({ message: "Error al agregar la data", error: error })
        }
    }
}

const handler = method({
    get: getHandler,
    post: postHandler,
    put: putHandler,
    delete: deleteHandler,
})

export default authMiddleware(handler)