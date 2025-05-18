import { firestore } from "../lib/firestore"
import { User } from "models/user"

export class UserRepository {
    private userCollection = firestore.collection("users")

    private async getUserDoc(userId: string) {
        try {
            const doc = await this.userCollection.doc(userId).get()
            if (!doc.exists) {
                throw new Error("no existe un documento asociado a este usuario")
            }
            return new User(doc.id, doc.data() as UserData)
        } catch (error) {
            console.error("no se pudo obtener el documento:", error.message)
            throw error
        }
    }

    async createUser(data: UserData): Promise<User> {
        try {
            const snap = await this.userCollection.add(data)
            return new User(snap.id, data)
        } catch (error) {
            console.error("no se pudo crear un nuevo user:", error.message)
            throw error
        }
    }


    async getUser(userId: string): Promise<User> {
        try {
            return await this.getUserDoc(userId)
        } catch (error) {
            console.error("no se pudo obtener los datos del usuario:", error.message)
            throw error
        }
    }

    async getCart(userId: string): Promise<ProductData[]> {
        try {
            const user = await this.getUserDoc(userId)
            const cartData = user.data.cart
            return cartData
        } catch (error) {
            console.error("no se pudo obtener los datos del carrito del usuario:", error.message)
            throw error
        }
    }

    async save(user: User) {
        await this.userCollection.doc(user.id).update(user.data as Record<string, any>)
    }

}






