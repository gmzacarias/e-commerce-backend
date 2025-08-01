import { hasStock } from "utils/hasStock"
import { hasProducts } from "utils/hasProducts"

jest.mock("utils/hasProducts", () => ({
    hasProducts: jest.fn()
}))

describe("test in function hasStock", () => {
    it("should return the products with stock", () => {
        const mockData = [{
            objectID: "1",
            stock: 10,
            quantity: 1
        }];
        (hasProducts as jest.Mock).mockReturnValue(true);
        const result = hasStock(mockData as any);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(result).toEqual(mockData);
    })

    it("should throw an error when hasProducts returns false", () => {
        const error = new Error("no hay productos");
        const mockData = [{
            objectID: "1",
            stock: 10,
            quantity: 1
        }];
        (hasProducts as jest.Mock).mockImplementation(() => false);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => hasStock(mockData as any)).toThrow(error);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should add an ObjectID to the outOfStock variable and throw an error", () => {
        const mockData = [
            {
                objectID: "1",
                stock: 10,
                quantity: 1
            },
            {
                objectID: "2",
                stock: 2,
                quantity: 3
            }];
        const outOfStock = [];
        outOfStock.push(mockData[1].objectID);
        const error = new Error(`productos sin stock:${outOfStock.join(", ")}`);
        (hasProducts as jest.Mock).mockReturnValue(true);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => hasStock(mockData as any)).toThrow(error);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should add a product without objectID to the outOfStock variable and throw an error", () => {
        const mockData = [
            {
                objectID: "1",
                stock: 10,
                quantity: 1
            },
            {

                stock: 2,
                quantity: 3
            }];
        const outOfStock = [];
        outOfStock.push("producto sin ID");

        const error = new Error("productos sin stock:producto sin ID");
        (hasProducts as jest.Mock).mockReturnValue(true);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => hasStock(mockData as any)).toThrow(error.message);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })
})