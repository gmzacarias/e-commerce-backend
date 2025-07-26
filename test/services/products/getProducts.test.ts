import { describe, expect } from "@jest/globals"
import { getProducts } from "services/products"
import { authAirtable, processAirtableProducts } from "services/airtable"

jest.mock("services/airtable", () => ({
    authAirtable: jest.fn(),
    processAirtableProducts: jest.fn()
}))

describe("test in function getProducts", () => {
    it("should return valid products", async () => {
        const records = [
            {
                productId: "1",
                system: "android",
                version: 13,
                brand: "motorola",
                familyModel: "g",
                model: "string",
                colour: "grey",
                rearCamera: "13 MPX",
                frontCamera: "10 MPX",
                ram: "8 GB",
                storage: "512 Gb",
                price: 99999,
                totalPrice: 0,
                quantity: 0,
                stock: 0,
                photo: "https://phones/pics/123456",
            },
            {
                productId: "2",
                system: "android",
                version: 13,
                brand: "motorola",
                familyModel: "g",
                model: "string",
                colour: "white",
                rearCamera: "13 MPX",
                frontCamera: "10 MPX",
                ram: "8 GB",
                storage: "512 Gb",
                price: 99999,
                totalPrice: 0,
                quantity: 0,
                stock: 0,
                photo: null,
            },
            {
                productId: "3",
                system: "android",
                version: 13,
                brand: "motorola",
                familyModel: "g",
                model: "string",
                colour: "green lime",
                rearCamera: "13 MPX",
                frontCamera: "10 MPX",
                ram: "8 GB",
                storage: "512 Gb",
                price: 99999,
                totalPrice: 0,
                quantity: 0,
                stock: 0,
                photo: "https://phones/pics/12345678",
            },
        ];
        const formatRecords = {
            validRecords: [
                {
                    ...records[0],
                    objectID: records[0].productId,
                    photo: "https://phones/pics/123456",
                    quantity: 0,
                    stock: 10,
                    totalPrice: records[0].price
                },
                {
                    ...records[2],
                    objectID: records[2].productId,
                    photo: "https://phones/pics/12345678",
                    quantity: 0,
                    stock: 10,
                    totalPrice: records[2].price
                },
            ],
            invalidRecords: ["2"],
        };
        (authAirtable as jest.Mock).mockResolvedValue(records);
        (processAirtableProducts as jest.Mock).mockResolvedValue(formatRecords);
        const result = await getProducts();
        expect(authAirtable).toHaveBeenCalled();
        expect(processAirtableProducts).toHaveBeenCalledWith(records);
        expect(result).toEqual(formatRecords.validRecords);
    })

    it("should throw an error when authAirtable has no records", async () => {
        const error = new Error("No hay records disponibles");
        (authAirtable as jest.Mock).mockRejectedValue(error);
        await expect(getProducts()).rejects.toThrow(error);
        expect(authAirtable).toHaveBeenCalled();
    })

    it("should throw an error when processAirtableProducts has no records to process", async () => {
        const error = new Error("Los datos obtenidos de Airtable no tienen registros");
        const records = [];
        (authAirtable as jest.Mock).mockResolvedValue(records);
        (processAirtableProducts as jest.Mock).mockRejectedValue(error);
         await expect(getProducts()).rejects.toThrow(error);
        expect(authAirtable).toHaveBeenCalled();
        expect(processAirtableProducts).toHaveBeenCalledWith(records);
    })
})