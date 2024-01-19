import { firestore } from "./firestore"
import { isAfter } from "date-fns"

const collection = firestore.collection("auth")




export class Auth {
    ref: FirebaseFirestore.DocumentReference
    data: any
    constructor(id) {
        this.ref = collection.doc(id)
    }
    async pull() {
        const snap = await this.ref.get()
        this.data = snap.data()
    }
    async push() {
        this.ref.update(this.data)
    }

    iscodeExpired(){
        const now = new Date()
        const expires = this.data.expire.toDate()
       console.log({now,expires})
        return isAfter(now,expires)
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
            newAuth.data = first.data()
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
            console.error("Email y code no coinciden")
            return null
        }
        const doc=result.docs[0]
        const auth = new Auth(doc.id)
        auth.data=doc.data()
        return auth
    }
}
