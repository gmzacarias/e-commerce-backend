import {User} from "lib/user"

export async function getOrderById(id:string):Promise<any>{
const user = new User(id)
await user.pull()
return user.data
}