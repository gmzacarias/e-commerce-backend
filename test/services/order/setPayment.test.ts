import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { formatDateFirebase } from "services/dateFns"
import { getPayment } from "services/mercadopago"

jest.mock("services/dateFns", () => ({
    formatDateFirebase: jest.fn().mockReturnValue("mock-date"),
}))

jest.mock("services/mercadopago", () => ({
    getPayment: jest.fn().mockReturnValue("mock-payment-data"),
}))

describe("test in method setPayment", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            getOrderDoc: jest.fn(),
            save: jest.fn(),
        }
        mockUserRepo = {}
        mockCartService = {}

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should save the payment related to the orderId and userId", async () => {
        const userId = "user001";
        const paymentId = "116221235241";
        const mockPayment = {
            data: {
                external_reference: "order001",
                id: 116221235241,
                date_created: "2025-07-06T22:30:48.123Z",
                currency_id: "ARS",
                status: "approved",
                status_detail: "accredited",
                installments: 2,
                payment_method_id: "visa",
                payment_type_id: "credit_card",
                transaction_amount: 1550999,
                transaction_details: {
                    installment_amount: 917726.11,
                    total_paid_amount: 1835452.22,
                },
                card: {
                    last_four_digits: "3704"
                }
            },

        };

        const mockOrder = {
            id: "order001",
            data: {
                orderId: "order001",
                userId: userId,
                status: "paid",
                created: {
                    _seconds: 1751236800,
                    _nanoseconds: 0
                },
                payment: null,
            },
            setPayment: jest.fn()
        };

        const expectedCreatedDate = new Date("2025-07-06T22:30:48.123Z").toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const expectedPaymentDate = new Date(mockPayment.data.date_created).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const mockExpectedPaymentData = {
            paymentId: mockPayment.data.id,
            paymentCreated: mockPayment.data.date_created,
            currencyId: mockPayment.data.currency_id,
            status: mockPayment.data.status,
            statusDetail: mockPayment.data.status_detail,
            installments: mockPayment.data.installments,
            paymentMethodId: mockPayment.data.payment_method_id,
            paymentTypeId: mockPayment.data.payment_type_id,
            transactionAmount: mockPayment.data.transaction_amount,
            transactionInstallmentAmout: mockPayment.data.transaction_details.installment_amount,
            transactionTotalAmount: mockPayment.data.transaction_details.total_paid_amount,
            fourDigitsCard: mockPayment.data.card.last_four_digits
        };

        const mockExpectedResult = {
            userId: mockOrder.data.userId,
            orderId: mockOrder.data.orderId,
            status: mockOrder.data.status,
            created: expectedCreatedDate,
            payment: {
                paymentId: mockPayment.data.id,
                paymentCreated: expectedPaymentDate,
                currencyId: mockPayment.data.currency_id,
                status: mockPayment.data.status,
                statusDetail: mockPayment.data.status_detail,
                installments: mockPayment.data.installments,
                paymentMethodId: mockPayment.data.payment_method_id,
                paymentTypeId: mockPayment.data.payment_type_id,
                transactionAmount: mockPayment.data.transaction_amount,
                transactionInstallmentAmout: mockPayment.data.transaction_details.installment_amount,
                transactionTotalAmount: mockPayment.data.transaction_details.total_paid_amount,
                fourDigitsCard: mockPayment.data.card.last_four_digits
            }
        };

        (getPayment as jest.Mock).mockResolvedValue(mockPayment.data);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.setPayment).mockImplementation((paymentData) => {
            mockOrder.data.payment = paymentData;
        });
        mockOrderRepo.save.mockResolvedValue(mockExpectedResult as any);
        (formatDateFirebase as jest.Mock).mockImplementation((date) => {
            if (
                date._seconds === mockOrder.data.created._seconds &&
                date._nanoseconds === mockOrder.data.created._nanoseconds
            ) {
                return new Date("2025-07-06T22:30:48.123Z")
            }
            return new Date()
        });

        const result = await orderService.setPayment(userId, paymentId);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockPayment.data.external_reference);
        expect(mockOrder.setPayment).toHaveBeenCalledWith(mockExpectedPaymentData);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(formatDateFirebase).toHaveBeenCalledWith(mockOrder.data.created);
        expect(result).toEqual(mockExpectedResult);
    })

    it("should save payment as null when the order has no payment data", async () => {
        const userId = "user001";
        const paymentId = "116221235241";

        const mockPayment = {
            data: {
                external_reference: "order001",
                id: 116221235241,
                date_created: "2025-07-06T22:30:48.123Z",
                currency_id: "ARS",
                status: "approved",
                status_detail: "accredited",
                installments: 2,
                payment_method_id: "visa",
                payment_type_id: "credit_card",
                transaction_amount: 1550999,
                transaction_details: {
                    installment_amount: 917726.11,
                    total_paid_amount: 1835452.22,
                },
                card: {
                    last_four_digits: "3704"
                }
            }
        };

        const mockOrder = {
            id: "order001",
            data: {
                orderId: "order001",
                userId: userId,
                status: "paid",
                created: {
                    _seconds: 1751236800,
                    _nanoseconds: 0
                },
                payment: null,
            },
            setPayment: jest.fn()
        };

        const mockExpectedPaymentData = {
            paymentId: mockPayment.data.id,
            paymentCreated: mockPayment.data.date_created,
            currencyId: mockPayment.data.currency_id,
            status: mockPayment.data.status,
            statusDetail: mockPayment.data.status_detail,
            installments: mockPayment.data.installments,
            paymentMethodId: mockPayment.data.payment_method_id,
            paymentTypeId: mockPayment.data.payment_type_id,
            transactionAmount: mockPayment.data.transaction_amount,
            transactionInstallmentAmout: mockPayment.data.transaction_details.installment_amount,
            transactionTotalAmount: mockPayment.data.transaction_details.total_paid_amount,
            fourDigitsCard: mockPayment.data.card.last_four_digits
        };

        const mockExpectedResult = {
            userId: mockOrder.data.userId,
            orderId: mockOrder.data.orderId,
            status: mockOrder.data.status,
            created: new Date("2025-07-06T22:30:48.123Z").toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }),
            payment: null
        };

        (getPayment as jest.Mock).mockResolvedValue(mockPayment.data);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.setPayment).mockImplementation(() => {
            mockOrder.data.payment = null;
        });
        mockOrderRepo.save.mockResolvedValue(mockExpectedResult as any);
        (formatDateFirebase as jest.Mock).mockImplementation((date) => {
            if (
                date._seconds === mockOrder.data.created._seconds &&
                date._nanoseconds === mockOrder.data.created._nanoseconds
            ) {
                return new Date("2025-07-06T22:30:48.123Z")
            }
            return new Date()
        });

        const result = await orderService.setPayment(userId, paymentId);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockPayment.data.external_reference);
        expect(mockOrder.setPayment).toHaveBeenCalledWith(mockExpectedPaymentData);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(formatDateFirebase).toHaveBeenCalledWith(mockOrder.data.created);
        expect(result).toEqual(mockExpectedResult);
    });

    it("should throw an error when getPayment does not return any data ", async () => {
        const error = new Error("No hay datos relacionadas al Id");
        const userId = "user001";
        const paymentId = "116221235241";
        (getPayment as jest.Mock).mockRejectedValue(error);
        await expect(orderService.setPayment(userId, paymentId)).rejects.toThrow(error);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
    })

    it("should throw an error when getOrderDoc does not return any data ", async () => {
        const error = new Error("No hay ordenes relacionadas al orderId");
        const userId = "user001";
        const paymentId = "116221235241";
        const mockPayment = {
            data: {
                external_reference: "order001",
                id: 116221235241,
                date_created: "2025-07-06T22:30:48.123Z",
                currency_id: "ARS",
                status: "approved",
                status_detail: "accredited",
                installments: 2,
                payment_method_id: "visa",
                payment_type_id: "credit_card",
                transaction_amount: 1550999,
                transaction_details: {
                    installment_amount: 917726.11,
                    total_paid_amount: 1835452.22,
                },
                card: {
                    last_four_digits: "3704"
                }
            },

        };

        (getPayment as jest.Mock).mockResolvedValue(mockPayment.data);
        mockOrderRepo.getOrderDoc.mockRejectedValue(error);
        await expect(orderService.setPayment(userId, paymentId)).rejects.toThrow(error);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockPayment.data.external_reference);
    })

    it("should throw an error when the payment data cannot be updated in the order", async () => {
        const error = new Error("No se pudo actualizar la orden");
        const userId = "user001";
        const paymentId = "116221235241";
        const mockPayment = {
            data: {
                external_reference: "order001",
                id: 116221235241,
                date_created: "2025-07-06T22:30:48.123Z",
                currency_id: "ARS",
                status: "approved",
                status_detail: "accredited",
                installments: 2,
                payment_method_id: "visa",
                payment_type_id: "credit_card",
                transaction_amount: 1550999,
                transaction_details: {
                    installment_amount: 917726.11,
                    total_paid_amount: 1835452.22,
                },
                card: {
                    last_four_digits: "3704"
                }
            },

        };

        const mockOrder = {
            id: "order001",
            data: {
                orderId: "order001",
                userId: userId,
                status: "paid",
                created: {
                    _seconds: 1751236800,
                    _nanoseconds: 0
                },
                payment: null,
            },
            setPayment: jest.fn()
        };

        const mockExpectedPaymentData = {
            paymentId: mockPayment.data.id,
            paymentCreated: mockPayment.data.date_created,
            currencyId: mockPayment.data.currency_id,
            status: mockPayment.data.status,
            statusDetail: mockPayment.data.status_detail,
            installments: mockPayment.data.installments,
            paymentMethodId: mockPayment.data.payment_method_id,
            paymentTypeId: mockPayment.data.payment_type_id,
            transactionAmount: mockPayment.data.transaction_amount,
            transactionInstallmentAmout: mockPayment.data.transaction_details.installment_amount,
            transactionTotalAmount: mockPayment.data.transaction_details.total_paid_amount,
            fourDigitsCard: mockPayment.data.card.last_four_digits
        };

        (getPayment as jest.Mock).mockResolvedValue(mockPayment.data);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.setPayment).mockImplementation(() => {
            throw error;
        });

        await expect(orderService.setPayment(userId, paymentId)).rejects.toThrow(error);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockPayment.data.external_reference);
        expect(mockOrder.setPayment).toHaveBeenCalledWith(mockExpectedPaymentData);
    })

    it("should throw an error when saving the order fails", async () => {
        const error = new Error("No se pudo guardar la orden");
        const userId = "user001";
        const paymentId = "116221235241";
        const mockPayment = {
            data: {
                external_reference: "order001",
                id: 116221235241,
                date_created: "2025-07-06T22:30:48.123Z",
                currency_id: "ARS",
                status: "approved",
                status_detail: "accredited",
                installments: 2,
                payment_method_id: "visa",
                payment_type_id: "credit_card",
                transaction_amount: 1550999,
                transaction_details: {
                    installment_amount: 917726.11,
                    total_paid_amount: 1835452.22,
                },
                card: {
                    last_four_digits: "3704"
                }
            },

        };

        const mockOrder = {
            id: "order001",
            data: {
                orderId: "order001",
                userId: userId,
                status: "paid",
                created: {
                    _seconds: 1751236800,
                    _nanoseconds: 0
                },
                payment: null,
            },
            setPayment: jest.fn()
        };

        const mockExpectedPaymentData = {
            paymentId: mockPayment.data.id,
            paymentCreated: mockPayment.data.date_created,
            currencyId: mockPayment.data.currency_id,
            status: mockPayment.data.status,
            statusDetail: mockPayment.data.status_detail,
            installments: mockPayment.data.installments,
            paymentMethodId: mockPayment.data.payment_method_id,
            paymentTypeId: mockPayment.data.payment_type_id,
            transactionAmount: mockPayment.data.transaction_amount,
            transactionInstallmentAmout: mockPayment.data.transaction_details.installment_amount,
            transactionTotalAmount: mockPayment.data.transaction_details.total_paid_amount,
            fourDigitsCard: mockPayment.data.card.last_four_digits
        };

        (getPayment as jest.Mock).mockResolvedValue(mockPayment.data);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.setPayment).mockImplementation((paymentData) => {
            mockOrder.data.payment = paymentData;
        });
        mockOrderRepo.save.mockRejectedValue(error);

        await expect(orderService.setPayment(userId, paymentId)).rejects.toThrow(error);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockPayment.data.external_reference);
        expect(mockOrder.setPayment).toHaveBeenCalledWith(mockExpectedPaymentData);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
    })

    it("should throw an error when formatDateFirebase could not format the dates", async () => {
        const error = new Error("No se pudo formatear los datos de las fechas");
        const userId = "user001";
        const paymentId = "116221235241";
        const mockPayment = {
            data: {
                external_reference: "order001",
                id: 116221235241,
                date_created: "2025-07-06T22:30:48.123Z",
                currency_id: "ARS",
                status: "approved",
                status_detail: "accredited",
                installments: 2,
                payment_method_id: "visa",
                payment_type_id: "credit_card",
                transaction_amount: 1550999,
                transaction_details: {
                    installment_amount: 917726.11,
                    total_paid_amount: 1835452.22,
                },
                card: {
                    last_four_digits: "3704"
                }
            },

        };

        const mockOrder = {
            id: "order001",
            data: {
                orderId: "order001",
                userId: userId,
                status: "paid",
                created: {
                    _seconds: 1751236800,
                    _nanoseconds: 0
                },
                payment: null,
            },
            setPayment: jest.fn()
        };



        const mockExpectedPaymentData = {
            paymentId: mockPayment.data.id,
            paymentCreated: mockPayment.data.date_created,
            currencyId: mockPayment.data.currency_id,
            status: mockPayment.data.status,
            statusDetail: mockPayment.data.status_detail,
            installments: mockPayment.data.installments,
            paymentMethodId: mockPayment.data.payment_method_id,
            paymentTypeId: mockPayment.data.payment_type_id,
            transactionAmount: mockPayment.data.transaction_amount,
            transactionInstallmentAmout: mockPayment.data.transaction_details.installment_amount,
            transactionTotalAmount: mockPayment.data.transaction_details.total_paid_amount,
            fourDigitsCard: mockPayment.data.card.last_four_digits
        };

        (getPayment as jest.Mock).mockResolvedValue(mockPayment.data);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.setPayment).mockImplementation((paymentData) => {
            mockOrder.data.payment = paymentData;
        });
        mockOrderRepo.save.mockResolvedValue(true);
        (formatDateFirebase as jest.Mock).mockImplementation(() => {
            throw error
        });

        await expect(orderService.setPayment(userId, paymentId)).rejects.toThrow(error);
        expect(getPayment).toHaveBeenCalledWith({ id: paymentId });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockPayment.data.external_reference);
        expect(mockOrder.setPayment).toHaveBeenCalledWith(mockExpectedPaymentData);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(formatDateFirebase).toHaveBeenCalledWith(mockOrder.data.created);
    })
})
