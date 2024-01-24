import { User } from "models/user"
import { Auth } from "models/auth"
import { addMinutes } from "date-fns"
import { SendCodeAuth } from "lib/emailjs"
import { generate } from "lib/jwt"
import gen from "random-seed"

//Generar una nueva semilla,cada vez que crea un numero aleatorio
const seed = new Date().toISOString();
let random = gen.create(seed)

export async function findCreateAuth(email: string): Promise<Auth> {
    //borrar espacios y pasarlos minuscula
    const cleanEmail = email.trim().toLowerCase()
    const auth = await Auth.findByEmail(cleanEmail)
    try {
        if (auth) {
            console.log("auth encontrado")
            return auth
        } else {
            const newUser = await User.createNewUser({
                email: cleanEmail,
                userName: "",
                phoneNumber: 0,
                cart: []
            })
            const newAuth = await Auth.createNewAuth({
                email: cleanEmail,
                userId: newUser.id,
                code: 0,
                expire: new Date()
            })
            return newAuth
        }
    } catch (error) {
        throw new Error("Error al buscar o crear Auth: " + error.message);
    }
}

export async function sendCode(email: string) {
   try{
       const auth = await findCreateAuth(email)
       const code = random.intBetween(10000, 99999)
       const now = new Date()
       const expirar = addMinutes(now, 5)
       auth.data.code = code
       auth.data.expire = expirar
       await auth.push()
       await SendCodeAuth(email, code)
       // console.log("email enviado a " + email + " con codigo:" + auth.data.code)
       return true
   }catch(error){
    console.error("Error al enviar el mail:", error.message);
    return null
   }
}

export async function signIn(email: string, code: number) {
   try{
       const auth = await Auth.findByEmailAndCode(email, code)
       if (!auth) {
          throw new Error ("No se pudo autorizar el ingreso")
       } else {
           const expires = auth.iscodeExpired()
           if (expires) {
               console.log("Code expirado")
               return null
           }
           const token = generate({ userId: auth.data.userId })
           console.log(token)
           return token
       }
   }catch(error){
    console.error("Error al intentar iniciar sesión:", error.message);
    return null
   }
}