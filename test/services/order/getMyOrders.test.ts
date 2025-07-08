import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { formatDateFirebase, checkExpirationPayments } from "services/dateFns"

jest.mock("services/dateFns", () => ({
    formatDateFirebase: jest.fn().mockReturnValue("mock-date"),
    checkExpirationPayments: jest.fn().mockReturnValue("mock-number")
}))

describe("test in method getMyOrders", () => {
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

    it("should return all my orders", async () => {
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

        mockOrderRepo.getOrders.mockResolvedValue(mockOrders as any);
        jest.spyOn(orderService, "checkExpirationOrders");
        (formatDateFirebase as jest.Mock).mockImplementation((date) => {
            if (
                date._seconds === mockOrders[0].created._seconds &&
                date._nanoseconds === mockOrders[0].created._nanoseconds
            ) {
                return new Date("2025-07-01T10:00:00.123Z")
            }
            return new Date()
        });

        const result = await orderService.getMyOrders("user1");
        expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user1");
        expect(orderService.checkExpirationOrders).toHaveBeenCalledWith(mockOrders);
        expect(formatDateFirebase as jest.Mock).toHaveBeenCalledWith(mockOrders[0].created);
        expect(result).toEqual(expectedOrders);
    })

    it("should throw an error if userId does not match", async () => {
        const error = new Error("No hay ordenes de este usuario");
        mockOrderRepo.getOrders.mockRejectedValue(error);
        await expect(orderService.getMyOrders("user2")).rejects.toThrow(error)
        expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user2");
    })

    it("should throw an error when getOrders does not return any data ", async () => {
        const error = new Error("No hay ordenes relacionadas al userId");
        mockOrderRepo.getOrders.mockRejectedValue(error);
        await expect(orderService.getMyOrders("user1")).rejects.toThrow(error);
        expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user1");
    })

    it("should throw an error if checkExpirationOrders has no data to check", async () => {
        const error = new Error("No hay datos para realizar la consulta");
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
        mockOrderRepo.getOrders.mockResolvedValue(mockOrders as any);
        jest.spyOn(orderService, "checkExpirationOrders").mockRejectedValue(error);
        await expect(orderService.getMyOrders("user1")).rejects.toThrow(error);
        expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user1");
        expect(orderService.checkExpirationOrders).toHaveBeenCalledWith(mockOrders);
    })

    it("should throw an error when formatDateFirebase could not format the dates", async () => {
        const error = new Error("No se pudo formatear los datos de las fechas");
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

        mockOrderRepo.getOrders.mockResolvedValue(mockOrders as any);
        jest.spyOn(orderService, "checkExpirationOrders");
        (formatDateFirebase as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.getMyOrders("user1")).rejects.toThrow(error);
        expect(mockOrderRepo.getOrders).toHaveBeenCalledWith("user1");
        expect(orderService.checkExpirationOrders).toHaveBeenCalledWith(mockOrders);
        expect(formatDateFirebase as jest.Mock).toHaveBeenCalledWith(mockOrders[0].created);
    })


})

