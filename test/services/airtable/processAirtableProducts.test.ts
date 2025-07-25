import { describe, expect } from "@jest/globals"
import { processAirtableProducts } from "services/airtable"
import { uploadCloudinary } from "services/cloudinary"

jest.mock("services/cloudinary", () => ({
    uploadCloudinary: jest.fn()
}))

describe("test in function processAirtableProducts", () => {
    it("should return valid products and invalid products that do not contain a photo", async () => {
        (uploadCloudinary as jest.Mock).mockResolvedValue({
            secure_url: "https://cloudinary.com/image.jpg"
        });
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

        const result = await processAirtableProducts(records);

        expect(result.validRecords).toHaveLength(2);
        expect(result.validRecords[0].objectID).toBe("1");
        expect(result.validRecords[1].objectID).toBe("3");
        expect(result.invalidRecords).toEqual(["2"]);
        expect(uploadCloudinary).toHaveBeenCalledTimes(2);
    })

    it("throw an error if there are no records", async () => {
        await expect(processAirtableProducts([])).rejects.toThrow(
            "Los datos obtenidos de Airtable no tienen registros"
        );
    });
})