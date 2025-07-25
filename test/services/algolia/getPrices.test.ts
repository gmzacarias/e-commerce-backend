import { describe, expect } from "@jest/globals"
import { getPrices } from "services/algolia"
import { productIndex } from "lib/algolia"

jest.mock("lib/algolia", () => ({
    productIndex: {
        search: jest.fn()
    }
}))

describe("test in function getPrices", () => {
    it("should return minPriceValue and maxPriceValue", async () => {
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
        (productIndex.search as jest.Mock).mockResolvedValue(results);
        const result = await getPrices();
        expect(productIndex.search).toHaveBeenCalledWith("", {
            facets: ['price'],
            maxValuesPerFacet: 1
        });
        expect(result).toEqual({ minPriceValue, maxPriceValue });
    })

    it("should throw an error when minPriceValue and maxPriceValue cannot be obtained", async () => {
        const error = new Error("No se pudieron obtener los precios minimos y maximos");
        (productIndex.search as jest.Mock).mockRejectedValue(error);
        await expect(getPrices()).rejects.toThrow(error);
        expect(productIndex.search).toHaveBeenCalledWith("", {
            facets: ['price'],
            maxValuesPerFacet: 1
        });
    })
})