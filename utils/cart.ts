import { User } from "models/user"

export async function checkCart(userId: string, productId?: string) {
    try {
        const user = await User.getMyCart(userId) as any
        if (user) {
            const getIds = user.map(item => item.id)
            for (const id of getIds) {
                if (id === productId) {
                    return true
                }
            }
        } else {
            throw new Error(`no existe carrito de compras del user ${userId}`)
        }
    } catch (error) {
        console.error(`error al obtener los ids de los productos del carrito de compras del user ${userId}:${error.message}`)
        throw error
    }
}