import { describe, expect } from "@jest/globals"
import { checkIndex } from "utils/checkIndex"
import { productIndex, productsAscIndex, productsDescIndex } from "lib/algolia"

describe("test in function checkIndexAlgolia", () => {
    it("should return productsAscIndex if sort is equal to price_asc", () => {
        const result = checkIndex("price_asc")
        expect(result).toBe(productsAscIndex)
    })

    it("should return productsAscIndex if sort is equal to price_desc", () => {
        const result = checkIndex("price_desc")
        expect(result).toBe(productsDescIndex)
    })

    it("should return productIndex if sort is not equal to price_asc or price_desc", () => {
        const result = checkIndex("")
        expect(result).toBe(productIndex)
    })
})