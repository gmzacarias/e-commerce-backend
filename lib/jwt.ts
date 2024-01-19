import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string

export function generate(data) {
    let token = jwt.sign(data, secret);
    return token
}

export function decode(token) {
    try {
        let decoded = jwt.verify(token, secret);
        return decoded
    } catch (error) {
    
        return null
    }
}