import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"

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
            const auth = await this.authRepo.getAuth(userId)
            if (data.userName) user.updateUserName(data.userName)
            if (data.phoneNumber) user.updatePhoneNumber(data.phoneNumber)
            if (data.email) {
                auth.updateEmail(data.email)
                user.updateEmail(data.email)
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