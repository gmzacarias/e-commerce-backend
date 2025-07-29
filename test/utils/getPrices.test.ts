import { describe, expect } from "@jest/globals"
import { getPrices } from "utils/getPrices"
import { productIndex, productsAscIndex, productsDescIndex } from "lib/algolia"
import { checkIndex } from "utils/checkIndex"

jest.mock("lib/algolia", () => ({
    productsAscIndex: {
        search: jest.fn()
    },
    productsDescIndex: {
        search: jest.fn()
    },
    productIndex: {
        search: jest.fn()
    }
}))

jest.mock("utils/checkIndex", () => ({
    checkIndex: jest.fn()
}))

describe("test in function getPrices", () => {
    it("should return minPriceValue and maxPriceValue when index is productsAscIndex", async () => {
        const mockIndex = "price_asc";
        const results = {
            facets_stats: {
                price: {
                    min: 10,
                    max: 25,
                }
            }
        };
        const minPriceValue = results.facets_stats.price.min;
        const maxPriceValue = results.facets_stats.price.max;
        (checkIndex as jest.Mock).mockImplementation(() => {
            return productsAscIndex;
        });
        (productsAscIndex.search as jest.Mock).mockResolvedValue(results as any);
        const result = await getPrices(mockIndex as any);
        expect(checkIndex).toHaveBeenCalledWith(mockIndex as any);
        expect(productsAscIndex.search).toHaveBeenCalledWith("", {
            facets: ['price'],
            maxValuesPerFacet: 1
        });
        expect(result).toEqual({ minPriceValue, maxPriceValue });
    })

    it("should return minPriceValue and maxPriceValue when index is productsDescIndex", async () => {
        const mockIndex = "price_desc";
        const results = {
            facets_stats: {
                price: {
                    min: 10,
                    max: 25,
                }
            }
        };
        const minPriceValue = results.facets_stats.price.min;
        const maxPriceValue = results.facets_stats.price.max;
        (checkIndex as jest.Mock).mockImplementation(() => {
            return productsDescIndex;
        });
        (productsDescIndex.search as jest.Mock).mockResolvedValue(results as any);
        const result = await getPrices(mockIndex as any);
        expect(checkIndex).toHaveBeenCalledWith(mockIndex as any);
        expect(productsDescIndex.search).toHaveBeenCalledWith("", {
            facets: ['price'],
            maxValuesPerFacet: 1
        });
        expect(result).toEqual({ minPriceValue, maxPriceValue });
    })

    it("should return minPriceValue and maxPriceValue when index is productIndex", async () => {
        const mockIndex = "";
        const results = {
            facets_stats: {
                price: {
                    min: 10,
                    max: 25,
                }
            }
        };
        const minPriceValue = results.facets_stats.price.min;
        const maxPriceValue = results.facets_stats.price.max;
        (checkIndex as jest.Mock).mockImplementation(() => {
            return productIndex;
        });
        (productIndex.search as jest.Mock).mockResolvedValue(results as any);
        const result = await getPrices(mockIndex as any);
        expect(checkIndex).toHaveBeenCalledWith(mockIndex as any);
        expect(productIndex.search).toHaveBeenCalledWith("", {
            facets: ['price'],
            maxValuesPerFacet: 1
        });
        expect(result).toEqual({ minPriceValue, maxPriceValue });
    })

    it("should throw an error when minPriceValue and maxPriceValue cannot be obtained", async () => {
        const error = new Error("No se pudieron obtener los precios minimos y maximos");
        (productIndex.search as jest.Mock).mockRejectedValue(error);
        await expect(getPrices("")).rejects.toThrow(error);
        expect(productIndex.search).toHaveBeenCalledWith("", {
            facets: ['price'],
            maxValuesPerFacet: 1
        });
    })
})