import { User } from "models/user"

export async function getOrderById(id: string): Promise<any> {
    const user = new User(id)
    await user.pull()
    return user.data
}

export async function getDataById(userId: string) {
    try {
        const user = await User.getMyData(userId)
        if (user) {
            return user
        }
    } catch (error) {
        console.error("No se pudo Obtener la data del usuario", error.message)
        return null
    }
}
