import type { NextApiRequest } from "next"
import { authSchema, tokenSchema } from "lib/schemas/authSchema"

export function validateAuth(req: NextApiRequest) {
    try {
        const result = authSchema.safeParse(req)
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateAuthToken(req: NextApiRequest) {
    try {
        const result = tokenSchema.safeParse(req)
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}