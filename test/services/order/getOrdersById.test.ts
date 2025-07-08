import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { formatDateFirebase } from "services/dateFns"

jest.mock("services/dateFns", () => ({
    formatDateFirebase: jest.fn().mockReturnValue("mock-date"),
}))

describe("test in method getOrdersById", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            getOrderDoc: jest.fn(),
        }
        mockUserRepo = {}
        mockCartService = {}

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should return an order by orderId", async () => {
        const mockOrder = {
            data: {
                userId: "user1",
                orderId: "order1",
                created:
                {
                    _seconds: 1751968800,
                    _nanoseconds: 123000000,
                },
                status: "pending",
                payment: {
                    paymentCreated: new Date("2025-07-01T10:05:00.123Z")
                }
            }
        };

        const expectedCreatedDate = new Date("2025-07-01T10:00:00.123Z").toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const expectedPaymentDate = mockOrder.data.payment.paymentCreated.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const expectedOrder = {
            userId: "user1",
            orderId: "order1",
            created: expectedCreatedDate,
            status: "pending",
            payment: {
                paymentCreated: expectedPaymentDate
            }
        };


        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (formatDateFirebase as jest.Mock).mockImplementation((date) => {
            if (
                date._seconds === mockOrder.data.created._seconds &&
                date._nanoseconds === mockOrder.data.created._nanoseconds
            ) {
                return new Date("2025-07-01T10:00:00.123Z")
            }
            return new Date()
        });

        const result = await orderService.getOrdersById(mockOrder.data.userId, mockOrder.data.orderId);
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.data.userId, mockOrder.data.orderId);
        expect(formatDateFirebase as jest.Mock).toHaveBeenCalledWith(mockOrder.data.created)
        expect(result).toEqual(expectedOrder);
    })

    it("should throw an error when orderId does not exist", async () => {
        const error = new Error("No existe el orderId");
        mockOrderRepo.getOrderDoc.mockRejectedValue(error);
        await expect(orderService.getOrdersById("user2", "order005")).rejects.toThrow(error)
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith("user2", "order005");
    })
})
