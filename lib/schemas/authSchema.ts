import { z } from "zod/v4"

const authSchema = z.strictObject({
    email: z.email()
})

const tokenSchema = authSchema.extend({
    code: z.number()
        .int()
        .refine(val => val >= 10000 && val <= 99999, {
            message: "el code debe tener 5 digitos"
        })
})

export { authSchema, tokenSchema }