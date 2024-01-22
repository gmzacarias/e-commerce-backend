import { User } from "models/user"
import { Auth } from "models/auth"
import { addMinutes } from "date-fns"
import { SendCodeAuth } from "lib/emailjs"
import { generate } from "lib/jwt"
import gen from "random-seed"

let seed = "my secret code"
let random = gen.create(seed)

export async function findCreateAuth(email: string): Promise<Auth> {
    //borrar espacios y pasarlos minuscula
    const cleanEmail = email.trim().toLowerCase()
    const auth = await Auth.findByEmail(cleanEmail)
    if (auth) {
        console.log("auth encontrado")
        return auth
    } else {
        const newUser = await User.createNewUser({
            email: cleanEmail
        })
        const newAuth = await Auth.createNewAuth({
            email: cleanEmail,
            userId: newUser.id,
            code: "",
            expire: new Date()
        })
        return newAuth
    }
}

export async function sendCode(email: string) {
    const auth = await findCreateAuth(email)
    const code = random.intBetween(10000, 99999)
    const now = new Date()
    const expirar = addMinutes(now, 5)
    auth.data.code = code
    auth.data.expire = expirar
    await auth.push()
    await SendCodeAuth(email, code)
    // console.log(SendCodeAuth)
    // console.log("email enviado a " + email + " con codigo:" + auth.data.code)
    return true
}

export async function signIn(email: string, code: number) {
    const auth = await Auth.findByEmailAndCode(email, code)
    if (!auth) {
        console.log("Email o code incorrecto")
        return null
    } else {
        const expires = auth.iscodeExpired()
        if (expires) {
            console.log("Code expirado")
            return null
        }
        const token = generate({ userId: auth.data.userId })
        console.log(token)
        return token
    }
}