import { User } from "models/user"

export async function getOrderById(id: string): Promise<any> {
    const user = new User(id)
    await user.pull()
    return user.data
}

export async function getDataById(userId: string){
    try {
        const user = await User.getMyData(userId)
        if (user) {
            return user.data
        } else {
            throw new Error("No se pudo obtener la data")
        }
    } catch (error) {
        console.error("Data del usuario", error.message)
        return null
    }
}
