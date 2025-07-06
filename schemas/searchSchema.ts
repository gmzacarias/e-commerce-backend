import { z } from "zod/v4"

const searchSchema = z.strictObject({
    q: z.string(),
    offset: z.preprocess((val) => Number(val), z.number().int().nonnegative()).transform((val) => String(val)),
    limit: z.preprocess((val) => Number(val), z.number().int().nonnegative()).transform((val) => String(val)),
    sort: z.enum(["price_asc", "price_desc"]),
    brand: z.string(),
    familyModel: z.string(),
    model: z.string(),
    colour: z.string(),
    system: z.string(),
    priceMin: z.preprocess((val) => Number(val), z.number().positive()),
    priceMax:z.preprocess((val) => Number(val), z.number().positive()),
})

const partialSearchSchema = searchSchema.partial().strict()
export { partialSearchSchema }