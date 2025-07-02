import { describe, expect } from "@jest/globals"
import { OrderService } from "./order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "./cart"
import { formatProductsForOrder, calcTotalPrice, formatItemsForPreference, hasStock } from "utils/cart"
import { checkExpirationPayments, formatExpireDateForPreference, formatDateFirebase } from "./dateFns"
import { updateStockProducts } from "./algolia"
import { createPreference, getMerchantOrderId, getPayment } from "./mercadopago"
import { saleAlert, purchaseAlert } from "./sendgrid"
import { getBaseUrl } from "utils/getBaseUrl"

jest.mock("utils/cart", () => ({
    formatProductsForOrder: jest.fn().mockReturnValue("mock-order-data"),
    calcTotalPrice: jest.fn().mockReturnValue("mock-total-price"),
    formatItemsForPreference: jest.fn().mockReturnValue("mock-items-data"),
    hasStock: jest.fn().mockReturnValue("mock-product-data"),
}))

jest.mock("services/dateFns", () => ({
    checkExpirationPayments: jest.fn().mockReturnValue("mock-number"),
    formatExpireDateForPreference: jest.fn().mockReturnValue("mock-string"),
    formatDateFirebase: jest.fn().mockReturnValue("mock-date"),
}))

jest.mock("services/algolia", () => ({
    updateStockProducts: jest.fn().mockReturnValue("mock-update-data"),
}))

jest.mock("services/mercadopago", () => ({
    createPreference: jest.fn().mockReturnValue("mock-new-Preference"),
    getMerchantOrderId: jest.fn().mockReturnValue("mock-order-data"),
    getPayment: jest.fn().mockReturnValue("mock-payment-data"),
}))

jest.mock("services/sendgrid", () => ({
    saleAlert: jest.fn().mockReturnValue("mock-send-sale-email"),
    purchaseAlert: jest.fn().mockReturnValue("mock-send-purchase-email"),
}))

jest.mock("utils/getBaseUrl", () => ({
    getBaseUrl: jest.fn().mockReturnValue("mock-url")
}))

describe("test in OrderService", () => {
    let orderService: OrderService
    let cartService: CartService
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            newOrder: jest.fn(),
            getOrders: jest.fn(),
            getOrderDoc: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
        }

        mockUserRepo = {
            getUser: jest.fn(),
        }

        orderService = new OrderService(mockOrderRepo, mockUserRepo)
    })

    it("should expire and save orders when expiration is >= 2 ", async () => {
        const mockOrderData = [
            {
                userId: "user1",
                orderId: "order1",
                created: new Date(),
                status: "pending",
            }
        ]

        const mockOrderInstance = {
            updateExpire: jest.fn(),
            data: mockOrderData[0],
            id: "order1"
        }

        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrderInstance as any);
        mockOrderRepo.save.mockResolvedValue(true);
        (checkExpirationPayments as jest.Mock).mockReturnValue(2);
        const result = await orderService.checkExpirationOrders(mockOrderData as any);
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith("user1", "order1");
        expect(mockOrderInstance.updateExpire).toHaveBeenCalledWith(true);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrderInstance);
        expect(result).toEqual(["order1"]);
    })

    it("should expire and save orders when status is closed", async () => {
        const mockOrderData = [
            {
                userId: "user1",
                orderId: "order1",
                created: new Date(),
                status: "closed",
            }
        ]

        const mockOrderInstance = {
            updateExpire: jest.fn(),
            data: mockOrderData[0],
            id: "order1"
        }

        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrderInstance as any);
        mockOrderRepo.save.mockResolvedValue(true);
        (checkExpirationPayments as jest.Mock).mockReturnValue(0);
        const result = await orderService.checkExpirationOrders(mockOrderData as any);
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith("user1", "order1");
        expect(mockOrderInstance.updateExpire).toHaveBeenCalledWith(true);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrderInstance);
        expect(result).toEqual(["order1"]);
    })

    it("should throw error if could not save orders", async () => {
        const error = new Error("Hubo un error al actualizar la orden");
        const mockOrderData = [
            {
                userId: "user1",
                orderId: "order1",
                created: new Date(),
                status: "pending",
            }
        ]

        const mockOrderInstance = {
            updateExpire: jest.fn(),
            data: mockOrderData[0],
            id: "order1"
        }

        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrderInstance as any);
        mockOrderRepo.save.mockRejectedValue(error);
        (checkExpirationPayments as jest.Mock).mockReturnValue(2);
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error)
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith("user1", "order1");
        expect(mockOrderInstance.updateExpire).toHaveBeenCalledWith(true);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrderInstance);
    })
})



