import { z } from "zod/v4"

const userSchema = z.strictObject({
    email: z.email(),
    userName: z.string().regex(/^[a-zA-Z\s]+$/),
    phoneNumber: z.string()
        .regex(/^\d{10}$/, {
            message: "phoneNumber debe tener exactamente 10 dígitos",
        }),
    address: z.object({
        street: z.string().optional(),
        locality: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.number().int().optional(),
        country: z.string().optional(),
    }).optional(),
})

const updateUserSchema = userSchema.partial().strict()

export { updateUserSchema }