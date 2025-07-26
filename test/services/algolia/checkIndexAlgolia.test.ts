import { describe, expect } from "@jest/globals"
import { checkIndexAlgolia } from "services/algolia"
import { productIndex, productsAscIndex, productsDescIndex } from "lib/algolia"

describe("test in function checkIndexAlgolia", () => {
    it("should return productsAscIndex if sort is equal to price_asc", () => {
        const result = checkIndexAlgolia("price_asc")
        expect(result).toBe(productsAscIndex)
    })

    it("should return productsAscIndex if sort is equal to price_desc", () => {
        const result = checkIndexAlgolia("price_desc")
        expect(result).toBe(productsDescIndex)
    })

    it("should return productIndex if sort is not equal to price_asc or price_desc", () => {
        const result = checkIndexAlgolia("")
        expect(result).toBe(productIndex)
    })
})