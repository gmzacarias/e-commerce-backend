import { calcTotalPrice } from "utils/calcToPrice"
import { hasProducts } from "utils/hasProducts"

jest.mock("utils/hasProducts", () => ({
    hasProducts: jest.fn()
}))

describe("test in function calcToPrice", () => {
    it("should calculate the total price and return the total value", () => {
        const mockData = [
            {
                productId: "1",
                price: 20,
                quantity: 5
            },
            {
                productId: "12",
                price: 20,
                quantity: 3
            },
        ];
        const expectedTotalPrice = 160;
        (hasProducts as jest.Mock).mockReturnValue(true);
        const result = calcTotalPrice(mockData as any);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(result).toBe(expectedTotalPrice);
    })

    it("should throw an error when hasProducts returns false", () => {
        const error = new Error("no hay productos");
        const mockData = [
            {
                productId: "1",
                price: 20,
                quantity: 5
            },
            {
                productId: "12",
                price: 20,
                quantity: 3
            },
        ];
        (hasProducts as jest.Mock).mockImplementation(() => false);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => calcTotalPrice(mockData as any)).toThrow(error);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })
})