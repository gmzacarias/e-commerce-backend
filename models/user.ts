import { firestore } from "../lib/firestore"

const collection = firestore.collection("users")

export class User {
    ref: FirebaseFirestore.DocumentReference
    data: UserData
    id: string
    constructor(id: string) {
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

    static async getUserDoc(userId: string): Promise<{ id: string; data: UserData }> {
        try {
            const userDoc = await collection.doc(userId).get();
            if (!userDoc.exists) {
                throw new Error("No existe un documento relacionado a este usuario");
            }
            return {
                id: userDoc.id,
                data: userDoc.data() as UserData
            };
        } catch (error) {
            console.error(`No se pudo obtener el documento: ${error.message}`);
            throw error;
        }
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
            const { id, data } = await this.getUserDoc(userId)
            const dataUser = new User(id)
            dataUser.data = data
            return dataUser;
        } catch (error) {
            console.error(`Error al obtener datos del usuario ${userId}: ${error.message}`);
            throw error;
        }
    }

    static async updateMyData(userId: string, newData: UserData): Promise<User> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const updateUser = new User(id)
            updateUser.data = data
            updateUser.data = newData
            await updateUser.push()
            return updateUser
        } catch (error) {
            console.error(`error al obtener datos del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async updateEmail(userId: string, email: string): Promise<User> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const updateUser = new User(id)
            updateUser.data = data
            updateUser.data.email = email
            await updateUser.push()
            return updateUser
        } catch (error) {
            console.error(`error al actualizar el email ${email} del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async updateUserName(userId: string, userName: string): Promise<User> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const updateUser = new User(id)
            updateUser.data = data
            updateUser.data.userName = userName
            await updateUser.push()
            return updateUser
        } catch (error) {
            console.error(`error al actualizar el userName ${userName} del usuario ${userId}:${error.message}`)
            throw error
        }
    }


    static async updatePhoneNumber(userId: string, phoneNumber: number): Promise<User> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const updateUser = new User(id)
            updateUser.data = data
            updateUser.data.phoneNumber = phoneNumber
            await updateUser.push()
            return updateUser
        } catch (error) {
            console.error(`error al actualizar el phoneNumber ${phoneNumber} del usuario ${userId}:${error.message}`)
            throw error
        }
    }


    static async updateAddress(userId: string, address: string): Promise<User> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const updateUser = new User(id)
            updateUser.data = data
            updateUser.data.address = address
            await updateUser.push()
            return updateUser
        } catch (error) {
            console.error(`error al actualizar el address ${address} del usuario ${userId}:${error.message}`)
            throw error
        }
    }

    static async getMyCart(userId: string): Promise<Array<any> | null> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const dataUser = new User(id)
            dataUser.data = data;
            return dataUser.data.cart
        } catch (error) {
            console.error(`error al obtener mi carrito de compras:${error.message}`)
            throw error
        }
    }


    static async addProductCart(userId: string, product: ProductData, quantity: number) {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const dataUser = new User(id)
            dataUser.data = data
            dataUser.data.cart.push({ ...product, quantity })
            await dataUser.push()
            return true
        } catch (error) {
            console.error(`error al agregar un producto a mi carrito de compras:${error.message}`)
            throw error
        }
    }

    static async updateQuantityProduct(userId: string, productId: string, quantity: number): Promise<boolean> {
        try {
            const { id, data } = await this.getUserDoc(userId)
            const dataUser = new User(id)
            dataUser.data = data
            const currentData = dataUser.data.cart
            const product = currentData.find((item) => item.id === productId)
            if (product) {
                product.quantity += quantity
                dataUser.data.cart = currentData
                await dataUser.push()
                return true
            }
            return false
        } catch (error) {
            console.error(`error al actualizar un producto a mi carrito de compras:${error.message}`)
            throw error
        }
    }


    static async deleteProductCart(userId: string, productId: string): Promise<boolean> {
        try {
            const { id } = await this.getUserDoc(userId)
            const dataUser = new User(id)
            await dataUser.pull()
            const myCart = dataUser.data.cart
            const newCart = myCart.filter(item => item.id !== productId)
            dataUser.data.cart = newCart
            await dataUser.push()
            return true
        } catch (error) {
            console.error(`error al eliminar un producto a mi carrito de compras:${error.message}`)
            throw error
        }
    }

    static async resetProductCart(userId: string): Promise<Array<any>> {
        try {
            const { id } = await this.getUserDoc(userId)
            const dataUser = new User(id)
            await dataUser.pull()
            dataUser.data.cart = []
            await dataUser.push()
            const currentCart = dataUser.data.cart
            return currentCart
        } catch (error) {
            console.error(`error al resetear mi carrito de compras:${error.message}`)
            throw error
        }
    }
}

