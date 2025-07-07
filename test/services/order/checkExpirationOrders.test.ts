import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { checkExpirationPayments } from "services/dateFns"

jest.mock("services/dateFns", () => ({
    checkExpirationPayments: jest.fn().mockReturnValue("mock-number"),
}))

describe("test in OrderService", () => {
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

    describe("test in method checkExpirationOrders", () => {
        it("should expire and save orders when expiration is >= 2 ", async () => {
            const createdDate = new Date("2025-06-27T18:30:25Z");
            const mockOrder = {
                id: "order001",
                userId: "user001",
                orderId: "order001",
                created: createdDate,
                status: "pending",
                expire: false,
                updateExpire: jest.fn()
            };

            const mockOrderData = [mockOrder];

            const mockExpectedOrder = {
                ...mockOrder,
                expire: true
            };

            (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            (mockOrder.updateExpire as jest.Mock).mockImplementation((value) => {
                mockExpectedOrder.expire = value;
            });
            mockOrderRepo.save.mockResolvedValue(mockExpectedOrder as any);
            const result = await orderService.checkExpirationOrders(mockOrderData as any);
            expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
            expect(mockOrder.updateExpire).toHaveBeenCalledWith(true);
            expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
            expect(result).toBeUndefined();
        })

        it("should expire and save orders when status is closed", async () => {
            const createdDate = new Date("2025-06-27T18:30:25Z");
            const mockOrder = {
                id: "order001",
                userId: "user001",
                orderId: "order001",
                created: createdDate,
                status: "closed",
                expire: false,
                updateExpire: jest.fn()
            };

            const mockOrderData = [mockOrder];

            const mockExpectedOrder = {
                ...mockOrder,
                expire: true
            };

            (checkExpirationPayments as jest.Mock).mockImplementation(() => 1);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            (mockOrder.updateExpire as jest.Mock).mockImplementation((value) => {
                mockExpectedOrder.expire = value;
            });
            mockOrderRepo.save.mockResolvedValue(mockExpectedOrder as any);
            const result = await orderService.checkExpirationOrders(mockOrderData as any);
            expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
            expect(mockOrder.updateExpire).toHaveBeenCalledWith(true);
            expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
            expect(result).toBeUndefined();
        })

        it("should throw an error if checkExpirationPayments has no data to check", async () => {
            const error = new Error("No hay datos para realizar la consulta");
            const mockOrder = {
                id: "order001",
                userId: "user001",
                orderId: "order001",
                created: undefined,
                status: "closed",
                expire: false,
                updateExpire: jest.fn()
            };

            const mockOrderData = [mockOrder];

            (checkExpirationPayments as jest.Mock).mockImplementation(() => {
                throw error
            });
            await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
            expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        })

        it("should throw an error when getOrderDoc does not return any data ", async () => {
            const error = new Error("No hay ordenes relacionadas al orderId");
            const createdDate = new Date("2025-06-27T18:30:25Z");
            const mockOrder = {
                id: "order001",
                userId: "user001",
                orderId: "order001",
                created: createdDate,
                status: "pending",
                expire: false,
            };
            const mockOrderData = [mockOrder];
            (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
            mockOrderRepo.getOrderDoc.mockRejectedValue(error);
            await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
            expect(checkExpirationPayments).toHaveBeenCalledWith(createdDate)
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
        })

        it("should throw an error when the expire data cannot be updated in the order", async () => {
            const error = new Error("No hay ordenes relacionadas al orderId");
            const createdDate = new Date("2025-06-27T18:30:25Z");
            const mockOrder = {
                id: "order001",
                userId: "user001",
                orderId: "order001",
                created: createdDate,
                status: "pending",
                expire: false,
                updateExpire: jest.fn()
            };

            const mockOrderData = [mockOrder];
            (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            (mockOrder.updateExpire as jest.Mock).mockImplementation(() => {
                throw error
            })
            await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
            expect(checkExpirationPayments).toHaveBeenCalledWith(createdDate)
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
            expect(mockOrder.updateExpire).toHaveBeenCalledWith(true);
        })

        it("", () => {

        })
    })
})

