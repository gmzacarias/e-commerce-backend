import { describe, expect } from "@jest/globals"
import { getFeaturedProducts } from "services/algolia"
import { productIndex } from "lib/algolia"

jest.mock("lib/algolia", () => ({
    productIndex: {
        search: jest.fn()
    }
}))

describe("test in function getFeaturedProducts", () => {
    it("should return the featured products of each brand", async () => {
        const mockHits = [
            { objectID: "1", brand: "Motorola", price: 100 },
            { objectID: "2", brand: "Motorola", price: 300 },
            { objectID: "3", brand: "Xiaomi", price: 200 },
            { objectID: "4", brand: "Xiaomi", price: 150 },
            { objectID: "5", brand: "Samsung", price: 400 }
        ];
        (productIndex.search as jest.Mock).mockResolvedValue({
            hits: mockHits
        });
        const result = await getFeaturedProducts();
        expect(productIndex.search).toHaveBeenCalledWith("", {
            attributesToHighlight: [],
        });
        expect(result).toEqual([
            { objectID: "2", brand: "Motorola", price: 300 },
            { objectID: "3", brand: "Xiaomi", price: 200 },
            { objectID: "5", brand: "Samsung", price: 400 }
        ]);
    })

    it("should throw an error when the search cannot be performed in Algolia", async () => {
        const error = new Error("No se pudo realizar la busqueda ");
        (productIndex.search as jest.Mock).mockRejectedValue(error);
        await expect (getFeaturedProducts()).rejects.toThrow(error);
        expect(productIndex.search).toHaveBeenCalledWith("", {
            attributesToHighlight: [],
        });
    })
})