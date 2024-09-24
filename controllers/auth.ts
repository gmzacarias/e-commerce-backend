import { User } from "models/user"
import { Auth } from "models/auth"
import { generate } from "lib/jwt"
import { sendCodeAuth } from "lib/sendgrid"
import { addMinutes } from "date-fns"
import gen from "random-seed"

const seed = new Date().toISOString();
let random = gen.create(seed)

export async function findCreateAuth(email: string): Promise<Auth> {
    const cleanEmail = Auth.cleanEmail(email)
    try {
        const auth = await Auth.findByEmail(cleanEmail)
        if (auth) {
            return auth
        } else {
            const newUser = await User.createNewUser({
                email: cleanEmail,
                userName: "",
                phoneNumber: 0,
                address: "",
                cart: []
            })
            const newAuth = await Auth.createNewAuth({
                email: cleanEmail,
                userId: newUser.id,
                code: 0,
                expire: new Date()
            })
            return newAuth
        }
    } catch (error) {
        console.error(`error al buscar o crear Auth:${error.message}`);
        throw error
    }
}

export async function sendCode(email: string) {
    try {
        const auth = await findCreateAuth(email)
        const code = random.intBetween(10000, 99999)
        const now = new Date()
        const expirar = addMinutes(now, 30)
        auth.data.code = code
        auth.data.expire = expirar
        await auth.push()
        await sendCodeAuth(email, code)
        return true
    } catch (error) {
        console.error(`Error al enviar el mail a ${email}: ${error.message}`);
        throw error
    }
}

export async function signIn(email: string, code: number) {
    const cleanEmail = Auth.cleanEmail(email)
    try {
        const auth = await Auth.findByEmailAndCode(cleanEmail, code) as any
        if (!auth) {
            throw new Error("No se pudo autorizar el ingreso")
        } else {
            const getData = await Auth.getDateExpire(auth.data.email)
            const isExpires = Auth.checkExpiration(getData)
            if (isExpires == false) {
                throw new Error("Codigo Expirado")
            } else {
                const token = generate({ userId: auth.data.userId })
                return token
            }
        }
    } catch (error) {
        console.error("Error al intentar iniciar sesión:", error.message);
        throw error
    }
}