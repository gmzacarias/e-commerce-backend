import { firestore } from "../lib/firestore"

const collection = firestore.collection("users")

export class User {
    ref: FirebaseFirestore.DocumentReference
    data: UserData
    id: string
    constructor(id) {
        this.id = id
        this.ref = collection.doc(id)
    }
    async pull() {
        const snap = await this.ref.get()
        this.data = snap.data() as UserData
    }

    async push() {
        this.ref.update(this.data as Record<string, any>)
    }

    static async createNewUser(data: UserData): Promise<User> {
        try {
            const newUserSnap = await collection.add(data)
            const newUser = new User(newUserSnap.id)
            newUser.data = data
            return newUser
        } catch (error) {
            console.error(`no se pudo crear el usuario:${error.message}`)
            throw error
        }
    }

    static async getMyData(userId: string): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                dataUser.data = user.data() as UserData;
                return dataUser
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al obtener datos del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async updateMyData(userId: string, newData: any): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const updateUser = new User(user.id)
                updateUser.data = user.data() as UserData
                updateUser.data = newData
                await updateUser.push()
                return updateUser
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al obtener datos del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async updateEmail(userId: string, email: string): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const updateUser = new User(user.id)
                updateUser.data = user.data() as UserData
                updateUser.data.email = email
                await updateUser.push()
                return updateUser
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al actualizar el email ${email} del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async updateUserName(userId: string, userName: string): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const updateUser = new User(user.id)
                updateUser.data = user.data() as UserData
                updateUser.data.userName = userName
                await updateUser.push()
                return updateUser
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al actualizar el userName ${userName} del usuario ${userId}:${error.message}`)
            throw error
        }
    }


    static async updatePhoneNumber(userId: string, phoneNumber: number): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const updateUser = new User(user.id)
                updateUser.data = user.data() as UserData
                updateUser.data.phoneNumber = phoneNumber
                await updateUser.push()
                return updateUser
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al actualizar el phoneNumber ${phoneNumber} del usuario ${userId}:${error.message}`)
            throw error
        }
    }


    static async updateAddress(userId: string, address: string): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const updateUser = new User(user.id)
                updateUser.data = user.data() as UserData
                updateUser.data.address = address
                await updateUser.push()
                return updateUser
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al actualizar el address ${address} del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async getMyCart(userId: string): Promise<Array<any> | null> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                dataUser.data = user.data() as UserData;
                return dataUser.data.cart
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al obtener mi carrito de compras:${error.message}`)
            throw error
        }
    }


    static async addProductCart(userId: string, product: ProductData, quantity: number) {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                dataUser.data = user.data() as UserData;
                dataUser.data.cart.push({ ...product, quantity })
                await dataUser.push()
                return true
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al agregar un producto a mi carrito de compras:${error.message}`)
            throw error
        }
    }

    static async updateQuantityProduct(userId: string, productId: string, quantity: number) {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                dataUser.data = user.data() as UserData
                const currentData = dataUser.data.cart
                const product = currentData.find((item) => item.id === productId)
                if (product) {
                    product.quantity += quantity
                    dataUser.data.cart = currentData
                    await dataUser.push()
                    return true
                } else {
                    return null
                }
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }

        } catch (error) {
            console.error(`error al actualizar un producto a mi carrito de compras:${error.message}`)
            throw error
        }
    }


    static async deleteProductCart(userId: string, productId: string) {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                await dataUser.pull()
                const myCart = dataUser.data.cart
                const newCart = myCart.filter(item => item.id !== productId)
                dataUser.data.cart = newCart
                await dataUser.push()
                return true
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al eliminar un producto a mi carrito de compras:${error.message}`)
            throw error
        }
    }

    static async resetProductCart(userId: string): Promise<Array<any>> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                await dataUser.pull()
                dataUser.data = user.data() as UserData
                dataUser.data.cart = []
                await dataUser.push()
                const currentCart = dataUser.data.cart
                return currentCart
            } else {
                throw new Error("el usuario no existe en la base de datos")
            }
        } catch (error) {
            console.error(`error al resetear mi carrito de compras:${error.message}`)
            throw error
        }
    }
}
