import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { getMerchantOrderId } from "services/mercadopago"
import { saleAlert, purchaseAlert } from "services/sendgrid"

jest.mock("services/mercadopago", () => ({
    getMerchantOrderId: jest.fn().mockReturnValue("mock-order-data"),
}))

jest.mock("services/sendgrid", () => ({
    saleAlert: jest.fn().mockReturnValue("mock-send-sale-email"),
    purchaseAlert: jest.fn().mockReturnValue("mock-send-purchase-email"),
}))

describe("test in method updateOrder", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            getOrderDoc: jest.fn(),
            save: jest.fn(),
        }

        mockUserRepo = {
            getUser: jest.fn(),
        }

        mockCartService = {}

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should update order and return an order", async () => {
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order001"
        };
        const mockOrder = {
            id: "order001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                status: "paid",
                totalPrice: 20000,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: "info adicional",
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            updateStatus: jest.fn()
        };

        const mockUser = {
            data: {
                email: "test@email.com",
                userName: "user demo",
                phoneNumber: "123456789",
                address: {
                    street: "fake street",
                    locality: "fake locality",
                    city: "fake city",
                    state: "fake state",
                    postalCode: 1234,
                    country: "fake country"
                },
                cart: [],
            }
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockResolvedValue(true);
        (purchaseAlert as jest.Mock).mockResolvedValue("Email de aviso de compra enviado");
        (saleAlert as jest.Mock).mockResolvedValue("Email de aviso de venta enviado");

        const result = await (orderService.UpdateOrder(userId, mockParams.topic, mockParams.id));
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(purchaseAlert).toHaveBeenCalledWith(mockUser.data.email, mockUser.data.userName, mockOrder.data);
        expect(saleAlert).toHaveBeenCalledWith(mockUser.data, mockOrder.data);
        expect(result).toBe(mockOrder);
    })

    it("should throw an error when topic is different from merchant_order", async () => {
        const userId = "user001";
        const mockParams = {
            topic: "payment",
            id: "9292929"
        };
        const result = await orderService.UpdateOrder(userId, mockParams.topic, mockParams.id);
        expect(result).toBeNull();
    })

    it("should throw an error when getMerchantOrderId is called with an id invalid", async () => {
        const error = new Error("El id ingresado es invalido");
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };

        (getMerchantOrderId as jest.Mock).mockRejectedValue(error);
        await expect(orderService.UpdateOrder(userId, mockParams.topic, mockParams.id)).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
    })

    it("should throw an error when order_status is differente from paid", async () => {
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "pending",
            external_reference: "order001"
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        const result = await orderService.UpdateOrder(userId, mockParams.topic, mockParams.id);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(result).toBeNull();
    })

    it("should throw an error when getOrderDoc does not return any data ", async () => {
        const error = new Error("No hay ordenes relacionadas al orderId");
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order005"
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockRejectedValue(error);
        await expect(orderService.UpdateOrder(userId, mockParams.topic, mockParams.id)).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
    })

    it("should throw an error when getUser does not return any data", async () => {
        const error = new Error("No hay datos relacionadas al userId");
        const userId = "user005";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order001"
        };
        const mockOrder = {
            id: "order001",
            data: {
                orderId: "orderId001",
                userId: "user001",
                products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                status: "paid",
                totalPrice: 20000,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: "info adicional",
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            updateStatus: jest.fn()
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        mockUserRepo.getUser.mockRejectedValue(error);
        await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
    })

    it("should throw an error when updating the order fails", async () => {
        const error = new Error("No se pudo actualizar el estado de la orden");
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order001"
        };
        const mockOrder = {
            id: "order001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                status: "paid",
                totalPrice: 20000,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: "info adicional",
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            updateStatus: jest.fn()
        };

        const mockUser = {
            data: {
                email: "test@email.com",
                userName: "user demo",
                phoneNumber: "123456789",
                address: {
                    street: "fake street",
                    locality: "fake locality",
                    city: "fake city",
                    state: "fake state",
                    postalCode: 1234,
                    country: "fake country"
                },
                cart: [],
            }
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        (mockOrder.updateStatus as jest.Mock).mockImplementation(() => {
            throw error
        });

        await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
    })

    it("should throw an error when saving the order fails", async () => {
        const error = new Error("No se pudo guardar la orden");
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order001"
        };
        const mockOrder = {
            id: "order001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                status: "paid",
                totalPrice: 20000,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: "info adicional",
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            updateStatus: jest.fn()
        };

        const mockUser = {
            data: {
                email: "test@email.com",
                userName: "user demo",
                phoneNumber: "123456789",
                address: {
                    street: "fake street",
                    locality: "fake locality",
                    city: "fake city",
                    state: "fake state",
                    postalCode: 1234,
                    country: "fake country"
                },
                cart: [],
            }
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockRejectedValue(error);

        await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
    })

    it("should throw an error when the purchase alert email fails to send ", async () => {
        const error = new Error("No se pudo enviar la alerta de compra");
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order001"
        };
        const mockOrder = {
            id: "order001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                status: "paid",
                totalPrice: 20000,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: "info adicional",
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            updateStatus: jest.fn()
        };

        const mockUser = {
            data: {
                email: "test@email.com",
                userName: "user demo",
                phoneNumber: "123456789",
                address: {
                    street: "fake street",
                    locality: "fake locality",
                    city: "fake city",
                    state: "fake state",
                    postalCode: 1234,
                    country: "fake country"
                },
                cart: [],
            }
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockResolvedValue(true);
        (purchaseAlert as jest.Mock).mockRejectedValue(error);

        await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(purchaseAlert).toHaveBeenCalledWith(mockUser.data.email, mockUser.data.userName, mockOrder.data);
    })

    it("should throw an error when the sale alert email fails to send", async () => {
        const error = new Error("No se pudo enviar la alerta de venta");
        const userId = "user001";
        const mockParams = {
            topic: "merchant_order",
            id: "9292929"
        };
        const mockMerchantOrder = {
            order_status: "paid",
            external_reference: "order001"
        };
        const mockOrder = {
            id: "order001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                status: "paid",
                totalPrice: 20000,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: "info adicional",
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            updateStatus: jest.fn()
        };

        const mockUser = {
            data: {
                email: "test@email.com",
                userName: "user demo",
                phoneNumber: "123456789",
                address: {
                    street: "fake street",
                    locality: "fake locality",
                    city: "fake city",
                    state: "fake state",
                    postalCode: 1234,
                    country: "fake country"
                },
                cart: [],
            }
        };

        (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockResolvedValue(true);
        (purchaseAlert as jest.Mock).mockResolvedValue("Email de aviso de compra enviado");
        (saleAlert as jest.Mock).mockRejectedValue(error);

        await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
        expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(purchaseAlert).toHaveBeenCalledWith(mockUser.data.email, mockUser.data.userName, mockOrder.data);
        expect(saleAlert).toHaveBeenCalledWith(mockUser.data, mockOrder.data);
    })
})
