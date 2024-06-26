import { User } from "models/user"
import { Auth } from "models/auth"
import { searchProductById } from "./products"

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
            throw new Error("No se pudo obtener la data")
        }
    } catch (error) {
        console.error("Data del usuario", error.message)
        return null
    }
}

export async function updateData(userId: string, newData: any) {
    try {
        const user = await User.updateUserData(userId, newData)
        const updateUserData = user.data
        if (user) {
            await Auth.updateEmail(userId, newData.email)
            // console.log(userId,newData.email)
            return updateUserData
        } else {
            throw new Error("No se pudo actualizar la data")
        }
    } catch (error) {
        console.error("Error con el usuario:", error.message);
        return null
    }
}

export async function updateSpecifiedData(userId: string, newData: any) {
    try {
        const user = await User.updateUserData(userId, newData)
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
            throw new Error("No se pudo actualizar la data")
        }
    } catch (error) {
        console.error("Error con el usuario:", error.message);
        return null
    }
}


export async function getCartById(userId: string) {
    try {
        const user = await User.getMyCart(userId)
        if (user) {
            return user
        } else {
            throw new Error("No se pudo obtener el carrito")
        }
    } catch (error) {
        console.error("Data del carrito", error.message)
        return null
    }
}

export async function addProductCartById(userId: string, productId: string, quantity: number) {
    try {
        const product = await searchProductById(productId) as any
        if (!product) {
            throw new Error("No existe el producto en el indie")
        } else {
            const addProduct = await User.addProductCart(userId, product, quantity)
            // console.log("response", addProduct)
            return addProduct
        }
    } catch (error) {
        console.error("Error en agregar el producto", error.message)
        return null
    }
}

export async function deleteProductCartById(userId: string, productId: string) {
    try {
        const currentCart = await User.getMyCart(userId)
        for (const findId of currentCart) {
            if (findId.id === productId) {
                const deleteProduct = await User.deleteProductCart(userId, productId)
                console.log("delete product", deleteProduct)
                return deleteProduct
            } else {
                throw new Error("No se pudo eliminar el producto")
            }
        }
    } catch (error) {
        console.error("Error en eliminar el producto", error.message)
        return null
    }
}

export async function resetCart(userId: string) {
    try {
        const response = await User.resetProductCart(userId)
        // console.log("controllers reset cart",response)
        if (response) {
            return response
        } else {
            throw new Error("No se pudo resetear el carrito")
        }
    } catch (error) {
        console.error("Error al resetear el carrito de compras", error.message)
        return null
    }
}