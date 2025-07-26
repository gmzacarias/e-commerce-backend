import { describe, expect } from "@jest/globals"
import { updateStockProducts } from "services/algolia"
import { productIndex } from "lib/algolia"

jest.mock("lib/algolia", () => ({
    productIndex: {
        partialUpdateObjects: jest.fn()
    }
}))

describe("test in function updateStockProducts", () => {
    it("should update the product associated with the objectID in Algolia", async () => {
        const data = [{ objectID: "1", stock: 5, quantity: 10 }];
        const formatData = [{ objectID: "1", stock: data[0].stock - data[0].quantity }];
        (productIndex.partialUpdateObjects as jest.Mock).mockResolvedValue("mock-response");
        const result = await updateStockProducts(data as any);
        expect(productIndex.partialUpdateObjects).toHaveBeenCalledWith(formatData as any);
        expect(result).toBe("mock-response");
    })

    it("should throw an error when an objectID cannot be updated", async () => {
        const data = [{ objectID: "1", stock: 5, quantity: 10 }];
        const error = new Error(`No se puede actualizar el objectID${data[0].objectID}`);
        const formatData = [{ objectID: "1", stock: data[0].stock - data[0].quantity }];
        (productIndex.partialUpdateObjects as jest.Mock).mockRejectedValue(error);
       await expect(updateStockProducts(data as any)).rejects.toThrow(error);
        expect(productIndex.partialUpdateObjects).toHaveBeenCalledWith(formatData as any);
    })
})