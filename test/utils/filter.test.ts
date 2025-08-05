import { getFilters } from "utils/filters"

describe("test in function getFilters", () => {
    it("should generate an array of strings that include the filters, returns a string", () => {
        const data = {
            brand: "Samsung,Motorola",
            familyModel: "Galaxy",
            priceMin: 1000,
            priceMax: 5000
        };
        const prices = {
            minPriceValue: 500,
            maxPriceValue: 10000
        };
        const result = getFilters(data as any, prices);
        expect(result).toEqual('(brand:"Samsung" OR brand:"Motorola") AND familyModel:Galaxy AND price >= 1000 AND price <= 5000');
    })

    it("should return only priceMin and priceMax", () => {
        const data = {
            priceMin: 100,
            priceMax: 20000
        };
        const prices = {
            minPriceValue: 500,
            maxPriceValue: 10000
        };
        const result = getFilters(data as any, prices);
        expect(result).toBe("price >= 500 AND price <= 10000");
    })

    it("should generate an array of strings that include the filters, it returns a string that does not include priceMin and priceMax", () => {
        const data = {
            brand: ["Samsung", "Motorola"],
            familyModel: "Galaxy",
        };
        const prices = {
            minPriceValue: 500,
            maxPriceValue: 10000
        };
        const result = getFilters(data as any, prices);
        expect(result).toEqual('(brand:"Samsung" OR brand:"Motorola") AND familyModel:Galaxy');
    })

    it("should return a string if data is an empty object", () => {
        const data = {};
        const prices = {
            minPriceValue: 500,
            maxPriceValue: 10000
        };
        const result = getFilters(data as any, prices);
        expect(result).toBe("");
    })

    it("should throw an error when data and/or prices are null", () => {
        const error = new Error("Faltan datos para generar los filtros");
        const data = null;
        const prices = null;
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => getFilters(data as any, prices)).toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })
})