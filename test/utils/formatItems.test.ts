import { formatItems } from "utils/formatItems"
import { hasProducts } from "utils/hasProducts";

jest.mock("utils/hasProducts", () => ({
    hasProducts: jest.fn()
}))

describe("test in function formatItems", () => {
    it("should format all products to create the preference.", () => {
        (hasProducts as jest.Mock).mockReturnValue(true);
        const mockData = [
            {
                productId: "123",
                brand: "Samsung",
                familyModel: "Galaxy",
                model: "S21",
                photo: "http://example.com/photo.jpg",
                quantity: 1,
                price: 200000
            }
        ];
        const expectedData=[{
            id: "123",
                title: "Samsung Galaxy S21",
                description: "smartphone Samsung Galaxy S21",
                picture_url:"http://example.com/photo.jpg",
                category_id: "Phones",
                quantity: 1,
                currency_id: "ARS",
                unit_price: 200000
        }]
        const result = formatItems(mockData as any);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
        expect(result).toEqual(expectedData as any);
    })

    it("should throw an error when hasProducts returns false", () => {
        const error = new Error("no hay productos")
        const mockData = [
            {
                productId: "123",
                brand: "Samsung",
                familyModel: "Galaxy",
                model: "S21",
                photo: "http://example.com/photo.jpg",
                quantity: 1,
                price: 200000
            }
        ];

        (hasProducts as jest.Mock).mockImplementation(() => false);
        expect(() => formatItems(mockData as any)).toThrow(error);
        expect(hasProducts).toHaveBeenCalledWith(mockData);
    })
})