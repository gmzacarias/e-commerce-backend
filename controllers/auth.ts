import { Auth } from "models/auth"
import { User } from "models/user"
import { sendCodeAuth } from "services/sendgrid"

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
                code: Auth.generateCode(),
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

export async function sendCode(email: string): Promise<boolean> {
    try {
        const auth = await findCreateAuth(email)
        const isExpired = Auth.checkExpiration(auth.data.expire)
        if (isExpired) {
            const newCode = Auth.generateCode()
            const expireDate = Auth.createExpireDate(30)
            await Auth.updateCodeAndExpire(auth.id, newCode, expireDate)
            await sendCodeAuth(email, newCode)
            return true
        }
        await sendCodeAuth(email, auth.data.code)
        return true
    } catch (error) {
        console.error(`Error al enviar el mail a ${email}: ${error.message}`);
        throw error
    }
}

export async function signIn(email: string, code: number): Promise<string> {
    const cleanEmail = Auth.cleanEmail(email)
    try {
        const auth = await Auth.findByEmailAndCode(cleanEmail, code)
        const isExpires = Auth.checkExpiration(auth.data.expire)
        if (isExpires) {
            throw new Error("el codigo ingresado ha expirado")
        }
        const token = Auth.generateToken(auth.data.userId)
        return token
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        throw error
    }
}