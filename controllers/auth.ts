import { User } from "models/user"
import { Auth } from "models/auth"
import { addMinutes } from "date-fns"
import gen from "random-seed"
import { SendCodeAuth } from "lib/emailjs"

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

