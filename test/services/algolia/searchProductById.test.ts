import { describe, expect } from "@jest/globals"
import { searchProductById } from "services/algolia"
import { productIndex } from "lib/algolia"

jest.mock("lib/algolia", () => ({
    productIndex: {
        getObject: jest.fn()
    }
}))

describe("test in function searchProductById", () => {
    it("should return the data of a product associated with the entered id", async () => {
        const productId = "21";
        const mockProductData = {
            objectID: "21",
            productId: "21",
            system: "Android",
            version: 12,
            brand: "Motorola",
            familyModel: "Edge",
            model: "50",
            colour: "black",
            rearCamera: "50 MPX",
            frontCamera: "12 MPX",
            ram: "8 GB",
            storage: "521 GB",
            price: 499999,
            totalPrice: 499999,
            quantity: 0,
            stock: 10,
            photo: "https://cloudinary.com/pics/21",
        };
        (productIndex.getObject as jest.Mock).mockResolvedValue(mockProductData);
        const result = await searchProductById(productId);
        expect(productIndex.getObject).toHaveBeenCalledWith(productId);
        expect(result).toEqual(mockProductData);
    })

    it("should throw an error when the entered productid is not found", async () => {
        const error = new Error("No se encontro el productId ingresado");
        const productId = "21";
        (productIndex.getObject as jest.Mock).mockRejectedValue(error);
        await expect(searchProductById(productId)).rejects.toThrow(error);
        expect(productIndex.getObject).toHaveBeenCalledWith(productId);
    })
})