import { describe, expect } from "@jest/globals"
import { merchantOrder } from "lib/mercadopago";
import { getMerchantOrderId } from "services/mercadopago"

jest.mock("lib/mercadopago", () => ({
    merchantOrder: {
        get: jest.fn(),
    },
}))

describe("test in function getMerchantOrderById", () => {
    it("should return the order data associated with the id", async () => {
        const orderData = {
            merchantOrderId: 12458
        };
        const mockOrder = {
            id: 123458,
            status: "closed",
            external_reference: "default",
            preference_id: "Preference identification",
            date_created: "2018-09-14T17:11:31.000Z",
            items: [
                {
                    id: 1234,
                    category_id: "item category",
                    currency_id: "BRL",
                    description: "item description",
                    picture_url: "item picture url",
                    title: "item title",
                    quantity: 1,
                    unit_price: 5
                }
            ],

        };
        (merchantOrder.get as jest.Mock).mockResolvedValue(mockOrder);
        const result = await getMerchantOrderId(orderData);
        expect(merchantOrder.get).toHaveBeenCalledWith(orderData);
        expect(result).toEqual(mockOrder);
    })

    it("should throw an error when getmerchantorderbyid does not find the order associated with the Id", async () => {
        const error = new Error("No se encontro una orden relacionada al Id")
        const orderData = {
            merchantOrderId: 12458
        };

        (merchantOrder.get as jest.Mock).mockRejectedValue(error);
        await expect(getMerchantOrderId(orderData)).rejects.toThrow(error);
        expect(merchantOrder.get).toHaveBeenCalledWith(orderData);
    })
})