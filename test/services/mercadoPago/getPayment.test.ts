import { describe, expect } from "@jest/globals";
import { payment } from "lib/mercadopago";
import { getPayment } from "services/mercadopago";

jest.mock("lib/mercadopago", () => ({
    payment: {
        get: jest.fn(),
    },
}))

describe("test in function getPayment", () => {
    it("should get a payment associated with the Id", async () => {
        const paymentId = {
            id: 123456789
        };
        const mockPaymentData = {
            id: 123456789,
            date_created: "2017-08-31T11:26:38.000Z",
            date_approved: "2017-08-31T11:26:38.000Z",
            date_last_updated: "2017-08-31T11:26:38.000Z",
            money_release_date: "2017-09-14T11:26:38.000Z",
            payment_method_id: "Pix",
            payment_type_id: "credit_card",
            status: "approved",
            status_detail: "accredited",
            currency_id: "BRL",
            description: "Pago Pizza",
            collector_id: 2,
            payer: {
                id: 123,
                email: "test_user_80507629@testuser.com",
                identification: {
                    type: "CPF",
                    number: 19119119100
                },

            },
            "metadata": {},
            "additional_info": {},
            "external_reference": "MP0001",
            "transaction_amount": 250,
            "transaction_amount_refunded": 0,
            "coupon_amount": 0,
            "transaction_details": {
                "net_received_amount": 250,
                "total_paid_amount": 250,
                "overpaid_amount": 0,
                "installment_amount": 250
            },
            installments: 1,
            card: {}
        };
        (payment.get as jest.Mock).mockResolvedValue(mockPaymentData);
        const result = await getPayment(paymentId);
        expect(payment.get).toHaveBeenCalledWith(paymentId);
        expect(result).toEqual(mockPaymentData);
    })

    it("should throw an error when getPayment cannot get a payment associated with the Id", async () => {
        const error = new Error("No se encontro un pago relacionado al Id");
        const paymentId = {
            id: 123456789
        };
        (payment.get as jest.Mock).mockRejectedValue(error);
        await expect(getPayment(paymentId)).rejects.toThrow(error);
        expect(payment.get).toHaveBeenCalledWith(paymentId);
    })
})