import { hasProducts } from "utils/hasProducts"

describe("test in function hasProducts", () => {
    it("should return true if data has products", () => {
        const data = [{ objectID: "1" }];
        const result = hasProducts(data as any);
        expect(result).toBe(true);
    })

    it("should return false if data has no products", () => {
        const data = [];
        const result = hasProducts(data as any);
        expect(result).toBe(false);
    })
})