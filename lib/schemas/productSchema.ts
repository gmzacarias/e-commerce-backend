import { z } from "zod/v4"

const productSchema = z.strictObject({
    productId: z.preprocess((val) => Number(val), z.number().int().positive()).transform((val) => String(val))
})

export { productSchema }