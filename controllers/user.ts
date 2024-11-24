import { User } from "models/user"
import { Auth } from "models/auth"
import { searchProductById } from "./products"
import { checkCart } from "utils/cart"

export async function getOrderById(id: string): Promise<any> {
    const user = new User(id)
    await user.pull()
    return user.data
}

export async function getDataById(userId: string) {
    try {
        const user = await User.getMyData(userId)
        if (user) {
            return user.data
        } else {
            throw new Error(`no se pudo obtener la data del user ${userId}`)
        }
    } catch (error) {
        console.error(`error al obtener la data del user ${userId}:${error.message}`)
        throw error
    }
}

export async function updateData(userId: string, newData: any) {
    try {
        const user = await User.updateMyData(userId, newData)
        const updateUserData = user.data
        if (user) {
            await Auth.updateEmail(userId, newData.email)
            return updateUserData
        } else {
            throw new Error(`no se pudo actualizar la data del user ${userId}`)
        }
    } catch (error) {
        console.error(`error al actualizar la data del user ${userId}:${error.message}`)
        throw error
    }
}

export async function updateSpecifiedData(userId: string, newData: any) {
    try {
        const user = await User.updateMyData(userId, newData)
        const updateUserData = user.data
        if (user) {
            if (newData.email) {
                await User.updateEmail(userId, newData.email)
                await Auth.updateEmail(userId, newData.email);
            }

            if (newData.userName) {
                await User.updateUserName(userId, newData.userName)
            }

            if (newData.phoneNumber) {
                await User.updatePhoneNumber(userId, newData.phoneNumber)
            }

            if (newData.address) {
                await User.updateAddress(userId, newData.address)
            }
            return updateUserData
        } else {
            throw new Error(`no se pudo actualizar la data del user ${userId}`)
        }
    } catch (error) {
        console.error(`error al actualizar la data del user ${userId}:${error.message}`)
        throw error
    }
}


export async function getCartById(userId: string) {
    try {
        const user = await User.getMyCart(userId)
        if (user) {
            return user
        } else {
            throw new Error(`no existe carrito de compras del user ${userId}`)
        }
    } catch (error) {
        console.error(`error al obtener la data del carrito de compras del user ${userId}:${error.message}`)
        throw error
    }
}

export async function addProductCartById(userId: string, productId: string, quantity: number) {
    try {
        const product = await searchProductById(productId) as any
        if (!product) {
            throw new Error(`no existe el producto ${productId} en el indice`)
        } else {
            const verifyCart = await checkCart(userId, productId)
            if (verifyCart) {
                const updateProduct = await User.updateQuantityProduct(userId, productId, quantity)
                return updateProduct
            }
            const addProduct = await User.addProductCart(userId, product, quantity)
            return addProduct
        }
    } catch (error) {
        console.error(`Error al agregar un producto del carrito de compras del usuario ${userId}:${error.message}`)
        throw error
    }
}

export async function deleteProductCartById(userId: string, productId: string) {
    try {
        const currentCart = await User.getMyCart(userId)
        for (const findId of currentCart) {
            if (findId.id === productId) {
                const deleteProduct = await User.deleteProductCart(userId, productId)

                return deleteProduct
            } else {
                throw new Error(`no se pudo eliminar el producto id ${productId}`)
            }
        }
    } catch (error) {
        console.error(`Error al eliminar un producto del carrito de compras del usuario ${userId}:${error.message}`)
        throw error
    }
}

export async function resetCart(userId: string) {
    try {
        const response = await User.resetProductCart(userId)
        if (response) {
            return response
        } else {
            throw new Error(`no se pudo resetear el carrito del user ${userId}`)
        }
    } catch (error) {
        console.error(`Error al resetear el carrito de compras del usuario ${userId}:${error.message}`)
        throw error
    }
}