import { Cart } from "models/cart"
import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"
import { searchProductById } from "./algolia"

export class UserService {
    constructor(private repo: UserRepository, private authRepo: AuthRepository) { }

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
            const auth = await this.authRepo.findByEmail(user.data.email)
            if (data.email) {
                user.updateEmail(data.email)
                auth.updateEmail(data.email)
            }

            if (data.userName) {
                user.updateUserName(data.userName)
            }

            if (data.address) {
                user.updateAddress(data.address)
            }

            if (data.phoneNumber) {
                user.updatePhoneNumber(data.phoneNumber)
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