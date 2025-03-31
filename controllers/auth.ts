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
                expire: (await Auth.createExpireDate(30, newUser.id)).expireDate
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
        const currentData = await Auth.generateCode(auth.data.userId)
        const checkExpired = Auth.checkExpiration(currentData.currentExpire)
        if (currentData.code && currentData.currentExpire && checkExpired === false) {
            await sendCodeAuth(email, currentData.code)
            await Auth.createExpireDate(30, auth.data.userId)
            await auth.push()
            return true
        }
        const newExpireDate = await Auth.createExpireDate(30, auth.data.userId)
        await sendCodeAuth(email, newExpireDate.currentCode)
        return true
    } catch (error) {
        console.error(`Error al enviar el mail a ${email}: ${error.message}`);
        throw error
    }
}

export async function signIn(email: string, code: number) {
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