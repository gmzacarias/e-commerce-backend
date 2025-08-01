import { formatProducts } from "utils/formatProducts"
import { hasProducts } from "utils/hasProducts"

jest.mock("utils/hasProducts", () => ({
    hasProducts: jest.fn()
}))

describe("test in function formatProducts", () => {
    it("", () => {
        const mockData = [{
            objectID: "1",
            brand: "Motorola",
            familyModel: "E",
            model: "22",
            colour: "grey",
            photo: "http://example.com/photo.jpg",
            quantity: 5,
            price: 20,
        }];
        const expectedResult = [{
            productId: "1",
            brand: "Motorola",
            familyModel: "E",
            model: "22",
            colour: "grey",
            photo: "http://example.com/photo.jpg",
            quantity: 5,
            price: 20,
        }];
        (hasProducts as jest.Mock).mockReturnValue(true);
        const result = formatProducts(mockData as any);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(result).toEqual(expectedResult);
    })

    it("should throw an error when hasProducts returns false", () => {
        const error = new Error("no hay productos");
        const mockData = [{
            objectID: "1",
            brand: "Motorola",
            familyModel: "E",
            model: "22",
            colour: "grey",
            photo: "http://example.com/photo.jpg",
            quantity: 5,
            price: 20,
        }];
        (hasProducts as jest.Mock).mockImplementation(() => false);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => formatProducts(mockData as any)).toThrow(error);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })
})