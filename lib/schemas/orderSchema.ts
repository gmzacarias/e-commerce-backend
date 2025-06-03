import { z } from "zod/v4"

const orderSchema = z.strictObject({
    additionalInfo: z.string().regex(/^[a-zA-Z0-9 ]+$/, "solo se permiten letras, números y espacios").optional()
})

const orderIdSchema = z.strictObject({
    orderId: z.string().regex(/^[A-Za-z0-9]+$/, "solo se permiten mayusculas,minusculas y números").length(20, "el id debe tener exactamente 20 caracteres")
})

export { orderSchema, orderIdSchema }