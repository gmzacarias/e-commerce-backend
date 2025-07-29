import { describe, expect } from "@jest/globals";
import { searchProductsByQuery } from "services/algolia";
import { productsAscIndex } from "lib/algolia";
import { getOffsetAndLimit } from "utils/pagination";
import { getPrices } from "utils/getPrices";
import { getFilters } from "utils/filters";
import { checkIndex } from "utils/checkIndex";

jest.mock("lib/algolia", () => ({
    productsAscIndex: {
        search: jest.fn(),
    },
}));

jest.mock("utils/pagination", () => ({
    getOffsetAndLimit: jest.fn(),
}));

jest.mock("utils/filters", () => ({
    getFilters: jest.fn(),
}));

jest.mock("utils/checkIndex", () => ({
    checkIndex: jest.fn(),
}));

jest.mock("utils/getPrices", () => ({
    getPrices: jest.fn()
}))

describe("test in function searchProductsByQuery", () => {
    it("should return search results in the Algolia index", async () => {
        const mockSearchResult = {
            hits: [{ objectID: "abc123" }],
            nbHits: 1,
            facets_stats: {
                price: {
                    min: 5,
                    max: 10,
                },
            },
        };
        const mockPrices = {
            minPriceValue: 5,
            maxPriceValue: 10,
        };
        const data = {
            q: "motorola",
            offset: 0,
            limit: 10,
            sort: "price_asc",
        };
        (getOffsetAndLimit as jest.Mock).mockReturnValue({ offset: 0, limit: 10 });
        (getPrices as jest.Mock).mockResolvedValue(mockPrices);
        (getFilters as jest.Mock).mockReturnValue([""]);
        (checkIndex as jest.Mock).mockReturnValue(productsAscIndex);
        (productsAscIndex.search as jest.Mock).mockResolvedValue(mockSearchResult);
        const result = await searchProductsByQuery(data as any);
        expect(getOffsetAndLimit).toHaveBeenCalledWith(data.offset, data.limit);
        expect(getPrices).toHaveBeenCalledWith("price_asc");
        expect(getFilters).toHaveBeenCalledWith(data, mockPrices);
        expect(checkIndex).toHaveBeenCalledWith("price_asc");
        expect(productsAscIndex.search).toHaveBeenCalledWith("motorola", {
            hitsPerPage: 10,
            page: 0,
            attributesToHighlight: [],
            filters: [""],
        });
        expect(result.results).toHaveLength(1);
        expect(result.pagination.totalResults).toBe(1);
    });

    it("should return search results on page 2 in the Algolia index.", async () => {
        const mockSearchResult = {
            hits: [{ objectID: "abc123" }],
            nbHits: 1,
            facets_stats: {
                price: {
                    min: 5,
                    max: 10,
                },
            },
        };
        const mockPrices = {
            minPriceValue: 5,
            maxPriceValue: 10,
        };
        const data = {
            q: "motorola",
            offset: 25,
            limit: 10,
            sort: "price_asc",
        };
        (getOffsetAndLimit as jest.Mock).mockReturnValue({ offset: 25, limit: 10 });
        (getPrices as jest.Mock).mockResolvedValue(mockPrices);
        (getFilters as jest.Mock).mockReturnValue([""]);
        (checkIndex as jest.Mock).mockReturnValue(productsAscIndex);
        (productsAscIndex.search as jest.Mock).mockResolvedValue(mockSearchResult);
        const result = await searchProductsByQuery(data as any);
        expect(getOffsetAndLimit).toHaveBeenCalledWith(data.offset, data.limit);
        expect(getPrices).toHaveBeenCalledWith("price_asc");
        expect(getFilters).toHaveBeenCalledWith(data, mockPrices);
        expect(checkIndex).toHaveBeenCalledWith("price_asc");
        expect(productsAscIndex.search).toHaveBeenCalledWith("motorola", {
            hitsPerPage: 10,
            page: 2,
            attributesToHighlight: [],
            filters: [""],
        });
        expect(result.results).toHaveLength(1);
        expect(result.pagination.totalResults).toBe(1);
    });

    it("should not return results when searching the Algolia index", async () => {
        const mockSearchResult = {
            hits: [{ objectID: "abc123" }],
            nbHits: 0,
            facets_stats: {
                price: {
                    min: 5,
                    max: 10,
                },
            },
        };
        const mockPrices = {
            minPriceValue: 5,
            maxPriceValue: 10,
        };
        const data = {
            q: "motorola",
            offset: 0,
            limit: 10,
            sort: "price_asc",
        };
        (getOffsetAndLimit as jest.Mock).mockReturnValue({ offset: 0, limit: 10 });
        (getPrices as jest.Mock).mockResolvedValue(mockPrices);
        (getFilters as jest.Mock).mockReturnValue([""]);
        (checkIndex as jest.Mock).mockReturnValue(productsAscIndex);
        (productsAscIndex.search as jest.Mock).mockResolvedValue(mockSearchResult);
        const result = await searchProductsByQuery(data as any);
        expect(getOffsetAndLimit).toHaveBeenCalledWith(data.offset, data.limit);
        expect(getPrices).toHaveBeenCalledWith("price_asc");
        expect(getFilters).toHaveBeenCalledWith(data, mockPrices);
        expect(checkIndex).toHaveBeenCalledWith("price_asc");
        expect(productsAscIndex.search).toHaveBeenCalledWith("motorola", {
            hitsPerPage: 10,
            page: 0,
            attributesToHighlight: [],
            filters: [""],
        });

        expect(result.results).toHaveLength(0);
        expect(result.pagination.totalResults).toBe(0);
    });

    it("should throw an error when the search could not be performed in the Algolia index", async () => {
        const error = new Error("No se pudo realizar la busqueda en el index de Algolia")
        const mockPrices = {
            minPriceValue: 5,
            maxPriceValue: 10,
        };
        const data = {
            q: "motorola",
            offset: 0,
            limit: 10,
            sort: "price_asc",
        };
        (getOffsetAndLimit as jest.Mock).mockReturnValue({ offset: 0, limit: 10 });
        (getPrices as jest.Mock).mockResolvedValue(mockPrices);
        (getFilters as jest.Mock).mockReturnValue([""]);
        (checkIndex as jest.Mock).mockReturnValue(productsAscIndex);
        (productsAscIndex.search as jest.Mock).mockRejectedValue(error);
        await expect(searchProductsByQuery(data as any)).rejects.toThrow(error);
        expect(getOffsetAndLimit).toHaveBeenCalledWith(data.offset, data.limit);
        expect(getPrices).toHaveBeenCalledWith("price_asc");
        expect(getFilters).toHaveBeenCalledWith(data, mockPrices);
        expect(checkIndex).toHaveBeenCalledWith("price_asc");
        expect(productsAscIndex.search).toHaveBeenCalledWith("motorola", {
            hitsPerPage: 10,
            page: 0,
            attributesToHighlight: [],
            filters: [""],
        });
    });
});
