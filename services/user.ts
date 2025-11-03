import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"
import { cleanEmail } from "utils/cleanEmail"

export class UserService {
    constructor(private repo: Partial<UserRepository>, private authRepo: Partial<AuthRepository>) { }

    async getUserData(userId: string): Promise<UserData> {
        try {
            const user = await this.repo.getUser(userId)
            return user.data
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async updateUserData(userId: string, data: Partial<UserData>): Promise<UserData> {
        try {
            const user = await this.repo.getUser(userId)
            const auth = await this.authRepo.getAuth(userId)
            const formatEmail = cleanEmail(data.email)
            if (data.userName) user.updateUserName(data.userName)
            if (data.phoneNumber) user.updatePhoneNumber(data.phoneNumber)
            if (data.email) {
                auth.updateEmail(formatEmail)
                user.updateEmail(formatEmail)
            }
            if (data.address) {
                const currentAddress = user.data.address
                const updateAddress = { ...currentAddress, ...data.address }
                user.updateAddress(updateAddress)
            }
            await this.repo.save(user)
            await this.authRepo.save(auth)
            return user.data
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }
}