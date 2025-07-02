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


   


    
})