import { describe, expect } from "@jest/globals"
import { saveProductsAlgolia } from "services/algolia"
import { productIndex } from "lib/algolia"
import { getProducts } from "services/products"

jest.mock("lib/algolia", () => ({
    productIndex: {
        saveObjects: jest.fn(),
        waitTask: jest.fn()
    }
}))

jest.mock("services/cloudinary", () => ({
    uploadCloudinary: jest.fn().mockResolvedValue({
        secure_url: "https://fake.url/uploaded-image.jpg"
    })
}))

jest.mock("services/products", () => ({
    getProducts: jest.fn()
}))

describe("saveProductsAlgolia", () => {
    it("should save the products in the Algolia index", async () => {
        const productsData = [
            {
                objectID: "589",
                name: "Producto 1",
                imageUrl: "https://fake.url/image.png"
            },
            {
                objectID: "258",
                name: "Producto 2",
                imageUrl: "https://fake.url/image2.png"
            }
        ];
        const fakeTaskIDs = { taskIDs: [1001, 1002] };
        (getProducts as jest.Mock).mockResolvedValue(productsData);
        (productIndex.saveObjects as jest.Mock).mockResolvedValue(fakeTaskIDs);
        (productIndex.waitTask as jest.Mock).mockResolvedValue(undefined);
        const result = await saveProductsAlgolia();
        expect(getProducts).toHaveBeenCalled();
        expect(productIndex.saveObjects).toHaveBeenCalledWith(productsData)
        expect(productIndex.waitTask).toHaveBeenCalledTimes(2);
        expect(productIndex.waitTask).toHaveBeenCalledWith(1001);
        expect(productIndex.waitTask).toHaveBeenCalledWith(1002);
        expect(result).toBe(true);
    })

    it("should throw an error when getproducts fails to get the products", async () => {
        const error = new Error("Hubo un error al obtener los productos");
        (getProducts as jest.Mock).mockRejectedValue(error);
        await expect(saveProductsAlgolia()).rejects.toThrow(error);
        expect(getProducts).toHaveBeenCalled();
    })

    it("should throw an error when saveObjects fails to save products", async () => {
        const error = new Error("Hubo un error al guardar los productos");
        const productsData = [
            {
                objectID: "589",
                name: "Producto 1",
                imageUrl: "https://fake.url/image.png"
            },
            {
                objectID: "258",
                name: "Producto 2",
                imageUrl: "https://fake.url/image2.png"
            }
        ];
        (getProducts as jest.Mock).mockResolvedValue(productsData);
        (productIndex.saveObjects as jest.Mock).mockRejectedValue(error);
        await expect(saveProductsAlgolia()).rejects.toThrow(error);
        expect(getProducts).toHaveBeenCalled();
        expect(productIndex.saveObjects).toHaveBeenCalledWith(productsData)
    })
})
































































































































































































































































































































































































