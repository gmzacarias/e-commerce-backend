import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { formatDateFirebase } from "services/dateFns"

jest.mock("services/dateFns", () => ({
    formatDateFirebase: jest.fn().mockReturnValue("mock-date"),
}))

describe("test in OrderService", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            getOrders: jest.fn(),
        }
        mockUserRepo = {}
        mockCartService = {}

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    describe("test in method getMyOrders", () => {
        it.skip("should return all my orders", async () => {
            const mockOrders = [
                {
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
            ]

            const expectedCreatedDate = new Date("2025-07-01T10:00:00.123Z").toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            const expectedPaymentDate = mockOrders[0].payment.paymentCreated.toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            const expectedOrders = [
                {
                    userId: "user1",
                    orderId: "order1",
                    created: expectedCreatedDate,
                    status: "pending",
                    payment: {
                        paymentCreated: expectedPaymentDate,
                    },
                }
            ];

            mockOrderRepo.getOrders.mockReturnValue(mockOrders as any);
            (formatDateFirebase as jest.Mock).mockImplementation((date) => {
                if (
                    date._seconds === mockOrders[0].created._seconds &&
                    date._nanoseconds === mockOrders[0].created._nanoseconds
                ) {
                    return new Date("2025-07-01T10:00:00.123Z")
                }
                return new Date()
            });

            jest.spyOn(orderService, "checkExpirationOrders")
            const result = await orderService.getMyOrders("user1");
            expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user1");
            expect(formatDateFirebase as jest.Mock).toHaveBeenCalledWith(mockOrders[0].created);
            expect(orderService.checkExpirationOrders(mockOrders as any));
            expect(result).toEqual(expectedOrders);
        })

        it("should throw an error if userId does not match", async () => {
            const error = new Error("No hay ordenes de este usuario");
            mockOrderRepo.getOrders.mockRejectedValue(error);
            await expect(orderService.getMyOrders("user2")).rejects.toThrow(error)
            expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user2");
        })
    })
})

