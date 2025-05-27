import { UserService } from "services/user"
import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"

const authRepo = new AuthRepository()
const userRepo = new UserRepository()
const userService = new UserService(userRepo, authRepo)

export async function getMyUser(userId: string): Promise<UserData> {
    return await userService.getUserData(userId)
}

export async function updateData(userId: string, newData: Partial<UserData>): Promise<UserData> {
    return await userService.updateUserData(userId, newData)
}






