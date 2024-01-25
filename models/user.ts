import { firestore } from "../lib/firestore"

interface UserData {
    email: string,
    userName: string,
    phoneNumber: number,
    address:string,
    cart: Array<any>,
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

    static async getMyData(userId: string) {
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
            console.error("Error al obtener datos del usuario:", error.message);
            return null
        }
    }

    static async updateUserData(userId:string, newData:any): Promise<User> {
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
            console.error("Error al obtener datos del usuario:", error.message);
            return null
        }
    }

    static async updateEmail(userId:string, email:string): Promise<User> {
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
            console.error("Error al obtener datos del usuario:", error.message);
            return null
        }
    }

    static async updateUserName(userId:string, userName:string): Promise<User> {
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
            console.error("Error al obtener datos del usuario:", error.message);
            return null
        }
    }


    static async updatePhoneNumber(userId:string, phoneNumber:number): Promise<User> {
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
            console.error("Error al obtener datos del usuario:", error.message);
            return null
        }
    }

    
    static async updateAddress(userId:string, address:string): Promise<User> {
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
            console.error("Error al obtener datos del usuario:", error.message);
            return null
        }
    }
}