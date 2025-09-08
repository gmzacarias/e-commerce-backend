import { AuthService } from "services/auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"

const authRepo = new AuthRepository()
const userRepo = new UserRepository()
const authService = new AuthService(authRepo, userRepo)

export async function sendCode(email: string): Promise<boolean> {
    return await authService.sendCode(email)
}

export async function signIn(email: string, code: number): Promise<{token:string,refreshToken:string}> {
    return await authService.authenticate(email, code)
}