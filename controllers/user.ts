import { User } from "models/user"
import { Auth } from "models/auth"

export async function getOrderById(id: string): Promise<any> {
    const user = new User(id)
    await user.pull()
    return user.data
}

export async function getDataById(userId: string) {
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

export async function updateData(userId: string, newData) {
    try {
        const user = await User.updateUserData(userId, newData)
        const updateUserData = user.data
        if (user) {
            await Auth.updateEmail(userId,newData.email)
            // console.log(userId,newData.email)
            return updateUserData
        } else {
            throw new Error("No se pudo actualizar la data")
        }
    } catch (error) {
        console.error("Error con el usuario:", error.message);
        return null
    }
}
