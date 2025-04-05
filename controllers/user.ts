import { User } from "models/user"
import { Auth } from "models/auth"
import { searchProductById } from "services/algolia"

export async function getDataById(userId: string): Promise<UserData> {
    try {
        const user = await User.getMyData(userId)
        return user.data
    } catch (error) {
        console.error(`error al obtener la data del user ${userId}:${error.message}`)
        throw error
    }
}

export async function updateData(userId: string, newData: UserData): Promise<UserData> {
    try {
        const user = await User.updateMyData(userId, newData)
        if (newData.email) {
            await Auth.updateEmail(userId, newData.email)
            const updateUserEmail = user.data
            return updateUserEmail
        }
        const updateUserData = user.data
        return updateUserData
    } catch (error) {
        console.error(`error al actualizar la data del user ${userId}:${error.message}`)
        throw error
    }
}

export async function updateSpecifiedData(userId: string, newData: UserData): Promise<UserData> {
    try {
        const user = await User.updateMyData(userId, newData)
        const updateUserData = user.data

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
    } catch (error) {
        console.error(`error al actualizar la data del user ${userId}:${error.message}`)
        throw error
    }
}

export async function getCartById(userId: string): Promise<ProductData[]> {
    try {
        const cartData = await User.getMyCart(userId)
        return cartData
    } catch (error) {
        console.error(`error al obtener la data del carrito de compras del user ${userId}:${error.message}`)
        throw error
    }
}

export async function checkCart(userId: string, productId?: string): Promise<boolean> {
    try {
        const cart = await User.getMyCart(userId)
        const checkId = cart.some(item => item.id === productId)
        return checkId
    } catch (error) {
        console.error(`error al obtener la data del carrito de compras del user ${userId}:${error.message}`)
        throw error
    }
}

export async function addProductCartById(userId: string, productId: string, quantity: number): Promise<boolean> {
    try {
        const product = await searchProductById(productId) as any
        const verifyCart = await checkCart(userId, productId)
        if (verifyCart) {
            const updateProduct = await User.updateQuantityProduct(userId, productId, quantity)
            return updateProduct
        }
        const addProduct = await User.addProductCart(userId, product, quantity)
        return addProduct
    } catch (error) {
        console.error(`Error al agregar un producto del carrito de compras del usuario ${userId}:${error.message}`)
        throw error
    }
}

export async function deleteProductCartById(userId: string, productId: string): Promise<boolean> {
    try {
        const deleteProduct = await User.deleteProductCart(userId, productId)
        return deleteProduct
    } catch (error) {
        console.error(`Error al eliminar un producto del carrito de compras del usuario ${userId}:${error.message}`)
        throw error
    }
}

export async function resetCart(userId: string): Promise<Array<any>> {
    try {
        const response = await User.resetProductCart(userId)
        return response
    } catch (error) {
        console.error(`Error al resetear el carrito de compras del usuario ${userId}:${error.message}`)
        throw error
    }
}



