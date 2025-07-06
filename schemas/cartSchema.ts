import { z } from "zod/v4"

const cartSchema = z.strictObject({
    productId: z.string().regex(/^\d+$/),
    quantity: z.number().int().min(1)
})

const partialCartSchema = cartSchema.partial().strict()
export { partialCartSchema }