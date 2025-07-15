import { describe, expect } from "@jest/globals";
import { preference } from "lib/mercadopago";
import { createPreference } from "services/mercadopago";

jest.mock("lib/mercadopago", () => ({
    preference: {
        create: jest.fn(),
    },
}))

describe("test in function createPreference", () => {
    it("should create a product preference and get a payment URL.", async () => {
        const data = {
            body: {
                items: [
                    {
                        id: '1234',
                        title: 'Dummy Title',
                        description: 'Dummy description',
                        picture_url: 'https://www.myapp.com/myimage.jpg',
                        category_id: 'car_electronics',
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: 10,
                    },
                ],
                marketplace_fee: 0,
                payer: {
                    name: 'Test',
                    surname: 'User',
                    email: 'your_test_email@example.com',
                    phone: {
                        area_code: '11',
                        number: '4444-4444',
                    },
                    identification: {
                        type: 'CPF',
                        number: '19119119100',
                    },
                    address: {
                        zip_code: '06233200',
                        street_name: 'Street',
                        street_number: 123,
                    },
                },
                back_urls: {
                    success: 'https://test.com/success',
                    failure: 'https://test.com/failure',
                    pending: 'https://test.com/pending',
                },
                expires: false,
                additional_info: 'Discount: 12.00',
                auto_return: 'all',

                external_reference: '1643827245',

                notification_url: 'https://notificationurl.com',
                operation_type: 'regular_payment',
            }
        };
        const mockPreferenceData = {
            "collector_id": 202809963,
            "items": [
                {
                    "title": "Dummy Item",
                    "description": "Multicolor Item",
                    "currency_id": "ARS",
                    "quantity": 1,
                    "unit_price": 10
                }
            ],
            "payer": {
                "phone": {},
                "identification": {},
                "address": {}
            },
            "back_urls": {
                "success": "https://test.com/success",
                "pending": "https://test.com/pending",
                "failure": "https://test.com/failure"
            },
            "auto_return": "approved",
            "notification_url": "https://notificationurl.com",
            "statement_descriptor": "MERCADOPAGO",
            "expiration_date_from": "2022-11-17T09:37:52.000-04:00",
            "expiration_date_to": "2022-11-17T10:37:52.000-05:00",
            "date_created": "2022-11-17T10:37:52.000-05:00",
            "id": "202809963-920c288b-4ebb-40be-966f-700250fa5370",
            "init_point": "https://www.mercadopago.com/mla/checkout/start?pref_id=202809963-920c288b-4ebb-40be-966f-700250fa5370",
            "sandbox_init_point": "https://sandbox.mercadopago.com/mla/checkout/pay?pref_id=202809963-920c288b-4ebb-40be-966f-700250fa5370",
            "metadata": {}
        };
        (preference.create as jest.Mock).mockResolvedValue(mockPreferenceData);
        const result = await createPreference(data);
        expect(preference.create).toHaveBeenCalledWith(data);
        expect(result).toEqual(mockPreferenceData);
    })

    it("should throw an error if createPreference failed when creating a preference in Mercado Pago", async () => {
        const error = new Error("Faltan datos para crear la preferencia");
        const data = {
            body: {
                items: [
                    {
                        id: '1234',
                        title: 'Dummy Title',
                        description: 'Dummy description',
                        picture_url: 'https://www.myapp.com/myimage.jpg',
                        category_id: 'car_electronics',
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: 10,
                    },
                ],
            }
        };
        (preference.create as jest.Mock).mockRejectedValue(error);
        await expect(createPreference(data)).rejects.toThrow(error);
        expect(preference.create).toHaveBeenCalledWith(data);
    })
})