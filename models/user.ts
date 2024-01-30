import { firestore } from "../lib/firestore"

interface ProductData {
    objectID: string,
    Model: string,
    Colour: string,
    Photo: string,
    Storage: string,
    FrontCamera: string,
    Brand: string,
    Price: number,
    Id: string,
    Android: string,
    Camera: string,
    Ram: string,
    stock: number,
}

interface UserData {
    email: string,
    userName: string,
    phoneNumber: number,
    address: string,
    cart: Array<any> | Array<ProductData>,
}

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

    static async createNewUser(data) {
        const newUserSnap = await collection.add(data)
        const newUser = new User(newUserSnap.id)
        newUser.data = data
        return newUser
    }

    static async getMyData(userId: string): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                // console.log(dataUser)
                dataUser.data = user.data() as UserData;
                return dataUser
            } else {
                throw new Error("El Usuario no existe")
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
        }
    }

    static async getDataUser(userId:string):Promise<User>{
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                // console.log(dataUser)
                dataUser.data = user.data() as UserData;
                return dataUser
            } else {
                throw new Error("El Usuario no existe")
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
        }
    }

    static async updateUserData(userId: string, newData: any): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const updateUser = new User(user.id)
                updateUser.data = user.data() as UserData
                updateUser.data = newData
                await updateUser.push()
                return updateUser
            } else {
                throw new Error("No se pudo obtener el usuario");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
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
                throw new Error("No se pudo obtener el usuario");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
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
                throw new Error("No se pudo obtener el usuario");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
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
                throw new Error("No se pudo obtener el usuario");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
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
                throw new Error("No se pudo obtener el usuario");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario: ", error.message);
            return null
        }
    }

    static async getMyCart(userId: string): Promise<Array<any> | null> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                // console.log(dataUser)
                dataUser.data = user.data() as UserData;
                return dataUser.data.cart
            } else {
                throw new Error("El Usuario no existe")
            }
        } catch (error) {
            console.error("Error al obtener datos del cart del usuario: ", error.message);
            return null
        }
    }

    static async addProductCart(userId: string, product: ProductData) {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                // console.log(dataUser)
                dataUser.data = user.data() as UserData;
                dataUser.data.cart.push(product)
                await dataUser.push()
                return product
            } else {
                throw new Error("El Usuario no existe")
            }
        } catch (error) {
            console.error("Error al agregar productos al cart del usuario: ", error.message);
            return null
        }
    }

    async findProduct() {

    }


    static async deleteProductCart(userId: string, productId: string): Promise<User> {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                await dataUser.pull()
                // console.log(productId)
                const newCart = dataUser.data.cart.filter(product => product.objectID !== productId)
                // console.log("soy el newcart", newCart)
                dataUser.data.cart = newCart
                await dataUser.push()
                // console.log("current", dataUser.data.cart)
                return dataUser
            } else {
                throw new Error("El Usuario no existe")
            }
        } catch (error) {
            console.error("Error al eliminar el producto: ", error.message);
            return null
        }
    }

    static async resetProductCart(userId: string) {
        try {
            const user = await collection.doc(userId).get()
            if (user.exists) {
                const dataUser = new User(user.id)
                await dataUser.pull()
                dataUser.data = user.data() as UserData
                dataUser.data.cart = []
                await dataUser.push()
                // console.log("soy el cart", dataUser)
                return dataUser
            } else {
                throw new Error("El Usuario no existe")
            }
        } catch (error) {
            console.error("Error al resetear el carrito: ", error.message);
            return null
        }
    }

}
