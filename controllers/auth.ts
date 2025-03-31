import { Auth } from "models/auth"
import { User } from "models/user"
import { sendCodeAuth } from "lib/sendgrid"

export async function findCreateAuth(email: string): Promise<Auth> {
    const cleanEmail = Auth.cleanEmail(email)
    try {
        const auth = await Auth.findByEmail(cleanEmail)
        if (!auth) {
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
                expire: Auth.createExpireDate(30)
            })
            return newAuth
        }
        return auth
    } catch (error) {
        console.error(`error al buscar el email o crear una nueva Auth:${error.message}`);
        throw error
    }
}

export async function sendCode(email: string) {
    try {
        const auth = await findCreateAuth(email)
        const code = await Auth.generateCode()
        const currentCode = auth.data.code
        const currentExpireDate = auth.data.expire
        const checkExpired = Auth.checkExpiration(currentExpireDate)
        if (currentCode && currentExpireDate && checkExpired === false) {
            await sendCodeAuth(email, currentCode)
            auth.data.expire = Auth.createExpireDate(30)
            await auth.push()
            return true
        }
        const expireDate = Auth.createExpireDate(30)
        auth.data.code = code
        auth.data.expire = expireDate
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
        const getData = auth.data.expire
        const isExpires = Auth.checkExpiration(getData)
        if (isExpires) {
            throw new Error("el codigo ingresado ha expirado")
        }
        const userId = auth.data.userId
        const token = Auth.generateToken(userId)
        return token
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        throw error
    }
}