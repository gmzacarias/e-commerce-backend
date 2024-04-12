import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { handlerCORS } from "lib/corsMiddleware"
import { authMiddleware } from "lib/middleware"
import { addProductCartById, deleteProductCartById, getCartById, resetCart, updateData } from "controllers/user"
import { validateBodyProduct, validateQueryProduct } from "lib/schemaMiddleware"

async function getHandler(req: NextApiRequest, res: NextApiResponse, token) {
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            const cart = await getCartById(token.userId)
            if (cart.length < 1) {
                res.status(200).send({ message: "El carrito esta vacio" })
            }
            res.status(200).send(cart)

        } catch (error) {
            res.status(400).send({ message: "Error al obtener la data", error: error })
        }
    }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse, token) {
    const { productId } = req.query as any
    const { quantity } = req.body as any
    if (!token) {
        res.status(401).send({ message: "No hay token" })
    } else {
        try {
            await validateQueryProduct(req, res)
            await validateBodyProduct(req, res)
            const addItem = await addProductCartById(token.userId, productId, quantity)
            if (!addItem) {
                res.status(404).send({ message: `el producto id ${productId} no se encontro en la base de datos` })
            }
            res.status(200).send({ message: `el producto id ${productId} fue agregado` })

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
            await validateQueryProduct(req, res)
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
            res.status(200).send({ message: "El carrito esta vacio" })

        } catch (error) {
            res.status(400).send({ message: "Error al resetear el carrito", error: error })
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