import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error("faltan credenciales de JWT en las variables de entorno")
}

const secret = process.env.JWT_SECRET

export { jwt, secret }

