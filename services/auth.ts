import { Auth } from "models/auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"
import { cleanEmail } from "utils/cleanEmail"
import { generateRandomCode } from "./randomSeed"
import { checkExpiration, createExpireDate } from "./dateFns"
import { generateToken } from "./jwt"
import { sendCodeAuth } from "./sendgrid"
import type { JwtPayload } from "jsonwebtoken"

export class AuthService {
    constructor(private repo: Partial<AuthRepository>, private userRepo: Partial<UserRepository>) { }

    async newAuth(email: string): Promise<Auth> {
        const formatEmail = cleanEmail(email)
        const code = generateRandomCode()
        const expire = createExpireDate(30)
        try {
            const verifyAuth = await this.repo.findByEmail(formatEmail)
            if (!verifyAuth) {
                const newUser = await this.userRepo.createUser({
                    email: formatEmail,
                    userName: "",
                    phoneNumber: "",
                    address: {
                        street: "",
                        locality: "",
                        city: "",
                        state: "",
                        postalCode: 0,
                        country: "",
                    },
                    cart: []
                })
                const createNewAuth = await this.repo.createAuth({
                    email: formatEmail,
                    userId: newUser.id,
                    code: code,
                    expire: expire
                })
                return createNewAuth
            }
            return verifyAuth
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async sendCode(email: string): Promise<boolean> {
        const formatEmail = cleanEmail(email)
        const newCode = generateRandomCode()
        const newExpireDate = createExpireDate(30)
        try {
            const auth = await this.newAuth(formatEmail)
            const isExpired = checkExpiration(auth.data.expire)
            let codeToSend = auth.data.code
            if (isExpired) {
                auth.updateCode(newCode)
                auth.updateExpire(newExpireDate)
                await this.repo.save(auth)
                codeToSend = newCode
            }
            await sendCodeAuth(formatEmail, codeToSend)
            return true
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async authenticate(email: string, code: number): Promise<string | JwtPayload> {
        const formatEmail = cleanEmail(email)
        try {
            await this.repo.findByEmail(formatEmail)
            const auth = await this.repo.findByCode(code)
            const isExpired = checkExpiration(auth.data.expire)
            if (isExpired) {
                throw new Error("el code ingresado a expirado")
            }
            const token = generateToken({ userId: auth.data.userId })
            return token
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }
}