import { firestore } from "lib/firestore"
import { Auth } from "models/auth"

export class AuthRepository {
    private authCollection = firestore.collection("auth")

    private async checkAuthDoc(id: string, userId: string): Promise<boolean> {
        try {
            const doc = await this.authCollection.doc(id).get()
            if (!doc.exists) {
                throw new Error("no existe un documento asociado a este id")
            }
            const data = doc.data() as AuthData
            if (data.userId !== userId) {
                throw new Error("el usuario no tiene acceso")
            }
            return true
        } catch (error) {
            console.error("no se pudo obtener el documento:", error.message)
            throw error
        }
    }


    async createAuth(data: AuthData): Promise<Auth> {
        try {
            const snap = await this.authCollection.add(data)
            return new Auth(snap.id, data)
        } catch (error) {
            console.error("no se pudo crear un nuevo auth:", error.message)
            throw error
        }
    }

    async getAuth(userId: string): Promise<Auth> {
        try {
            const snap = await this.authCollection.where("userId", "==", userId).get()
            if (snap.empty) {
                throw new Error("el userId ingresado no coincide con los registros de la db")
            }
            const doc = snap.docs[0]
            return new Auth(doc.id, doc.data() as AuthData)
        } catch (error) {
            console.error("hubo un error en la busqueda:", error.message)
            throw error
        }
    }

    async findByEmail(email: string): Promise<Auth | null> {
        try {

            const snap = await this.authCollection.where("email", "==", email).get()
            if (snap.empty) {
                return null
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
            throw error
        }
    }

    async save(data: Auth): Promise<boolean> {
        try {
            await this.checkAuthDoc(data.id, data.data.userId)
            const auth = new Auth(data.id, data.data)
            await this.authCollection.doc(auth.id).update(auth.data as Record<string, any>)
            return true
        } catch (error) {
            console.error("no se pudo actualizar el documento:", error.message)
            throw error
        }
    }
}
