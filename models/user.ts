import { firestore } from "../lib/firestore"

interface UserData {
    email: string,
    userName: string,
    phoneNumber: number,
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
}