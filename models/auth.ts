import { firestore } from "lib/firestore"
import { addMinutes, isAfter } from "date-fns"
import gen from "random-seed"
import { generate } from "lib/jwt"

const collection = firestore.collection("auth")

export class Auth {
    ref: FirebaseFirestore.DocumentReference
    data: AuthData
    id:string
    constructor(id:string) {
        this.ref = collection.doc(id)
    }

    async pull() {
        const snap = await this.ref.get()
        this.data = snap.data() as AuthData
    }

    async push() {
        this.ref.update(this.data as Record<string, any>)
    }

    static cleanEmail(email: string):string {
        return email.trim().toLowerCase()
    }

    static async generateCode(userId: string): Promise<{ code: number, currentExpire: Date }> {
        const seed = new Date().toISOString();
        let random = gen.create(seed)
        const code = random.intBetween(10000, 99999)
        try {
            const result = await collection.where("userId", "==", userId).get()
            if (result.empty) {
                throw new Error(`El userId ${userId} no existe`)
            } else {
                const auth = new Auth(result.docs[0].id)
                auth.data = result.docs[0].data() as AuthData
                auth.data.code = code
                const currentExpire = auth.data.expire
                await auth.push()
                return { code, currentExpire }
            }
        } catch (error) {
            console.error(`Error al guardar el code asociado al ${userId}:${error.message}`)
            throw error
        }
    }


    static async createExpireDate(minutes: number, userId: string): Promise<{ currentCode: number, expireDate: Date }> {
        const now = new Date()
        const expireDate = addMinutes(now, minutes)
        try {
            const result = await collection.where("userId", "==", userId).get()
            if (result.empty) {
                throw new Error(`El userId ${userId} no existe`)
            } else {
                const auth = new Auth(result.docs[0].id)
                auth.data = result.docs[0].data() as AuthData
                const currentCode = auth.data.code
                auth.data.expire = expireDate
                await auth.push()
                return { currentCode, expireDate }
            }
        } catch (error) {
            console.error(`Error al guardar el code asociado al ${userId}:${error.message}`)
            throw error
        }
    }

    static checkExpiration(date): Boolean {
        const currentDate = new Date()
        const { _nanoseconds, _seconds } = date
        const expirationDate = new Date(_seconds * 1000 + Math.floor(_nanoseconds / 1000));
        const result = isAfter(currentDate, expirationDate)
        return result
    }

    static generateToken(userId: string): string {
        const createToken = generate({ userId: userId })
        return createToken
    }

    static async findByEmail(email: string): Promise<Auth | null> {
        try {
            const results = await collection.where("email", "==", email).get()
            if (results.docs.length === 1) {
                const firstResults = results.docs[0]
                const newAuth = new Auth(firstResults.id)
                newAuth.data = firstResults.data() as AuthData
                return newAuth
            }
            return null
        } catch (error: any) {
            console.error(`hubo un problema al buscar el ${email}:`, error.message)
            throw error
        }
    }

    static async createNewAuth(data: AuthData): Promise<Auth> {
        try {
            const newUserSnap = await collection.add(data)
            const newUser = new Auth(newUserSnap.id)
            newUser.data = data
            return newUser
        } catch (error) {
            console.error(`no se pudo crear el usuario:${error.message}`)
            throw error
        }
    }

    static async findByEmailAndCode(email: string, code: number): Promise<Auth> {
        try {
            const checkEmail = await collection.where("email", "==", email).get()
            if (checkEmail.empty) {
                throw new Error("no se encontro el email en la base de datos")
            }
            const result = await collection.where("email", "==", email).where("code", "==", code).get()
            if (result.empty) {
                throw new Error("el codigo ingresado es incorrecto")
            }
            const doc = result.docs[0]
            const auth = new Auth(doc.id)
            auth.data = doc.data() as AuthData
            return auth
        } catch (error) {
            console.error(`Error al buscar al usuario asociado al ${email}:${error.message}`)
            throw error
        }
    }

    static async updateEmail(userId: string, email: string): Promise<Auth> {
        const cleanEmail = Auth.cleanEmail(email)
        try {
            const result = await collection.where("userId", "==", userId).get()
            if (result.empty) {
                throw new Error(`El userId ${userId} no existe`)
            } else {
                const auth = new Auth(result.docs[0].id)
                auth.data = result.docs[0].data() as AuthData
                auth.data.email = cleanEmail
                await auth.push()
                return auth
            }
        } catch (error) {
            console.error(`no se pudo actualizar la informacion del userId ${userId}:${error.message}`)
            throw error
        }
    }
}
