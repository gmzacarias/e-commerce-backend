import { firestore } from "../lib/firestore"
import { isAfter } from "date-fns"

interface AuthData {
    email: string,
    userId: string,
    code: number,
    expire: Date,
}

const collection = firestore.collection("auth")

export class Auth {
    ref: FirebaseFirestore.DocumentReference
    data: AuthData
    constructor(id) {
        this.ref = collection.doc(id)
    }
    async pull() {
        const snap = await this.ref.get()
        this.data = snap.data() as AuthData
    }
    async push() {
        this.ref.update(this.data as Record<string, any>)
    }

    iscodeExpired() {
        const now = new Date()
        const expires = this.data.expire
        console.log({ now, expires })
        return isAfter(now, expires)
    }

    static cleanEmail(email: string) {
        return email.trim().toLowerCase()
    }

    //el static lo hace un metodo de toda la clase
    static async findByEmail(email: string) {
        const cleanEmail = Auth.cleanEmail(email)
        const results = await collection.where("email", "==", cleanEmail).get()
        if (results.docs.length) {
            const first = results.docs[0]
            const newAuth = new Auth(first.id)
            newAuth.data = first.data() as AuthData
            return newAuth
        } else {
            return null
        }
    }

    static async createNewAuth(data) {
        const newUserSnap = await collection.add(data)
        const newUser = new Auth(newUserSnap.id)
        newUser.data = data
        return newUser
    }

    static async findByEmailAndCode(email: string, code: number) {
        const cleanEmail = Auth.cleanEmail(email)
        const result = await collection.where("email", "==", cleanEmail).where("code", "==", code).get()
        if (result.empty) {
            // console.error("Email y code no coinciden")
            return null
        } else {
            const doc = result.docs[0]
            const auth = new Auth(doc.id)
            auth.data = doc.data() as AuthData
            return auth
        }
    }

    static async updateEmail(userId: string, email: string) {
        const cleanEmail = Auth.cleanEmail(email)
        const result = await collection.where("userId", "==", userId).get()
        if (result.empty) {
            console.error("El user id no existe")
        } else {
            const auth = new Auth(result.docs[0].id)
            auth.data = result.docs[0].data() as AuthData
            auth.data.email = cleanEmail
            await auth.push()
            return auth
        }
    }
}
