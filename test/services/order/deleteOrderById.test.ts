import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"

describe("test in method deleteOrderById", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            delete: jest.fn()
        }

        mockUserRepo = {}
        mockCartService = {}

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should delete an order associated with the orderId", async () => {
        const userId = "user001";
        const orderId = "order001";
        mockOrderRepo.delete.mockResolvedValue(true);
        const result = await orderService.deleteOrderById(userId, orderId);
        expect(mockOrderRepo.delete).toHaveBeenCalledWith(userId, orderId);
        expect(result).toEqual(true);
    })

    it("should delete an order associated with the orderId", async () => {
        const error = new Error("OrderId no esta asociado al usuario ingresado")
        const userId = "user001";
        const orderId = "order001";
        mockOrderRepo.delete.mockRejectedValue(error);
        await expect(orderService.deleteOrderById(userId, orderId)).rejects.toThrow(error);
        expect(mockOrderRepo.delete).toHaveBeenCalledWith(userId, orderId);
    })
})
