import { firestore } from "lib/firestore"
import { Auth } from "models/auth"

export class AuthRepository {
    private authCollection = firestore.collection("auth")

    async createAuth(data: AuthData): Promise<Auth> {
        try {
            const snap = await this.authCollection.add(data)
            return new Auth(snap.id, data)
        } catch (error) {
            console.error("no se pudo crear un nuevo auth:", error.message)
            throw error
        }
    }


    async findByEmail(email: string): Promise<Auth> {
        try {
            const snap = await this.authCollection.where("email", "==", email).get()
            if (snap.empty) {
                throw new Error("el email ingresado no coincide con los registrados de la db")
            }
            const doc = snap.docs[0]
            return new Auth(doc.id, doc.data() as AuthData)
        } catch (error) {
            console.error("hubo un error en la busqueda:", error.message)
            throw error
        }
    }

    async findByCode(code: number): Promise<Auth> {
        try {
            const snap = await this.authCollection.where("code", "==", code).get()
            if (snap.empty) {
                throw new Error("el code ingresado no coincide con los registros de la db")
            }
            const doc = snap.docs[0]
            return new Auth(doc.id, doc.data() as AuthData)
        } catch (error) {
            console.error("hubo un error en la busqueda:", error.message)
        }
    }

    async save(auth: Auth) {
        await this.authCollection.doc(auth.id).update(auth.data as Record<string, any>)
    }

}
