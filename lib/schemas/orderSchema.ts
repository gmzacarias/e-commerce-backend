import { z } from "zod/v4"

const orderSchema = z.strictObject({
    additionalInfo: z.string().regex(/^[a-zA-Z0-9 ]+$/,"solo se permiten letras, números y espacios").optional()
})

export { orderSchema }