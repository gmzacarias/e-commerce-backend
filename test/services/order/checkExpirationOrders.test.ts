import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { checkExpirationPayments } from "services/dateFns"
import { searchProductById, updateStockProducts } from "services/algolia"

jest.mock("services/dateFns", () => ({
    checkExpirationPayments: jest.fn().mockReturnValue(2)
}))

jest.mock("services/algolia", () => ({
    searchProductById: jest.fn().mockResolvedValue({
        objectID: "1",
        productId: "1",
        stock: 5,
        quantity: 0
    }),
    updateStockProducts: jest.fn().mockResolvedValue(true)
}))

describe("test in method checkExpirationOrders", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        jest.clearAllMocks();
        mockOrderRepo = {
            getOrderDoc: jest.fn(),
            save: jest.fn(),
        }
        mockUserRepo = {}
        mockCartService = {}
        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should expire and save orders when the expiration is >= 2 and the status is not equal to closed", async () => {
        const productsToReturn = {
            objectID: "1",
            stock: 5,
            quantity: 2
        };
        const mockOrder = {
            userId: "user001",
            orderId: "order001",
            created: {
                _seconds: 1751968800,
                _nanoseconds: 123000000,
            },
            status: "pending",
            expire: false,
            updateExpire: jest.fn(),
            products: [{ productId: "1", quantity: 2 }]
        };
        const mockOrderData = [mockOrder];
        const mockExpectedOrder = {
            ...mockOrder,
            expire: true
        };
        (checkExpirationPayments as jest.Mock).mockReturnValue(2);
        (searchProductById as jest.Mock).mockReturnValue(productsToReturn);
        (updateStockProducts as jest.Mock).mockResolvedValue(true);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.updateExpire as jest.Mock).mockImplementation((value) => {
            mockExpectedOrder.expire = value;
        });
        mockOrderRepo.save.mockResolvedValue(mockExpectedOrder as any);
        const result = await orderService.checkExpirationOrders(mockOrderData as any);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        expect(searchProductById).toHaveBeenCalledWith(mockOrder.products[0].productId);
        expect(updateStockProducts).toHaveBeenCalledWith([productsToReturn], "add");
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
        expect(mockOrder.updateExpire).toHaveBeenCalledWith(true);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(result).toBeUndefined();
    })

    it("should throw an error if checkExpirationPayments has no data to check", async () => {
        const error = new Error("No hay datos para realizar la consulta");
        const mockOrder = {
            created: undefined,
            updateExpire: jest.fn()
        };
        const mockOrderData = [mockOrder];
        (checkExpirationPayments as jest.Mock).mockImplementation(() => {
            throw error
        });
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        expect(searchProductById).not.toHaveBeenCalled();
        expect(updateStockProducts).not.toHaveBeenCalled();
        expect(mockOrderRepo.getOrderDoc).not.toHaveBeenCalled();
        expect(mockOrder.updateExpire).not.toHaveBeenCalled();
        expect(mockOrderRepo.save).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when searchProductById does not find the product", async () => {
        const error = new Error("No existe el objectID ingresado");
        const mockOrder = {
            userId: "user001",
            orderId: "order001",
            created: {
                _seconds: 1751968800,
                _nanoseconds: 123000000,
            },
            status: "pending",
            expire: false,
            updateExpire: jest.fn(),
            products: [{ productId: "1", quantity: 2 }]
        };
        const mockOrderData = [mockOrder];
        (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
        (searchProductById as jest.Mock).mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        expect(searchProductById).toHaveBeenCalledWith(mockOrder.products[0].productId);
        expect(updateStockProducts).not.toHaveBeenCalled();
        expect(mockOrderRepo.getOrderDoc).not.toHaveBeenCalled();
        expect(mockOrder.updateExpire).not.toHaveBeenCalled();
        expect(mockOrderRepo.save).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should an error when updateStockProducts fails", async () => {
        const error = new Error("No hay productos");
        const productsToReturn = {
            objectID: "1",
            stock: 5,
            quantity: 2
        };
        const mockOrder = {
            userId: "user001",
            orderId: "order001",
            created: {
                _seconds: 1751968800,
                _nanoseconds: 123000000,
            },
            status: "pending",
            expire: false,
            updateExpire: jest.fn(),
            products: [{ productId: "1", quantity: 2 }]
        };
        const mockOrderData = [mockOrder];
        (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
        (searchProductById as jest.Mock).mockResolvedValue(productsToReturn);
        (updateStockProducts as jest.Mock).mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        expect(searchProductById).toHaveBeenCalledWith(mockOrder.products[0].productId);
        expect(updateStockProducts).toHaveBeenCalledWith([productsToReturn], "add");
        expect(mockOrderRepo.getOrderDoc).not.toHaveBeenCalled();
        expect(mockOrder.updateExpire).not.toHaveBeenCalled();
        expect(mockOrderRepo.save).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when getOrderDoc does not return any data ", async () => {
        const error = new Error("No hay ordenes relacionadas al orderId");
        const productsToReturn = {
            objectID: "1",
            stock: 5,
            quantity: 2
        };
        const mockOrder = {
            userId: "user001",
            orderId: "order001",
            created: {
                _seconds: 1751968800,
                _nanoseconds: 123000000,
            },
            status: "pending",
            expire: false,
            updateExpire: jest.fn(),
            products: [{ productId: "1", quantity: 2 }]
        };
        const mockOrderData = [mockOrder];
        (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
        (searchProductById as jest.Mock).mockResolvedValue(productsToReturn);
        (updateStockProducts as jest.Mock).mockResolvedValue(true);
        mockOrderRepo.getOrderDoc.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created)
        expect(searchProductById).toHaveBeenCalledWith(mockOrder.products[0].productId);
        expect(updateStockProducts).toHaveBeenCalledWith([productsToReturn], "add");
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
        expect(mockOrder.updateExpire).not.toHaveBeenCalled();
        expect(mockOrderRepo.save).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when the expire data cannot be updated in the order", async () => {
        const error = new Error("No hay ordenes relacionadas al orderId");
        const productsToReturn = {
            objectID: "1",
            stock: 5,
            quantity: 2
        };
        const mockOrder = {
            userId: "user001",
            orderId: "order001",
            created: {
                _seconds: 1751968800,
                _nanoseconds: 123000000,
            },
            status: "pending",
            expire: false,
            updateExpire: jest.fn(),
            products: [{ productId: "1", quantity: 2 }]
        };
        const mockOrderData = [mockOrder];
        (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
        (searchProductById as jest.Mock).mockResolvedValue(productsToReturn);
        (updateStockProducts as jest.Mock).mockResolvedValue(true);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.updateExpire as jest.Mock).mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        expect(searchProductById).toHaveBeenCalledWith(mockOrder.products[0].productId);
        expect(updateStockProducts).toHaveBeenCalledWith([productsToReturn], "add");
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
        expect(mockOrder.updateExpire).toHaveBeenCalledWith(true);
        expect(mockOrderRepo.save).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when updating the order fails", async () => {
        const error = new Error("No se pudo actualizar el estado de la orden");
        const productsToReturn = {
            objectID: "1",
            stock: 5,
            quantity: 2
        };
        const mockOrder = {
            userId: "user001",
            orderId: "order001",
            created: {
                _seconds: 1751968800,
                _nanoseconds: 123000000,
            },
            status: "pending",
            expire: false,
            updateExpire: jest.fn(),
            products: [{ productId: "1", quantity: 2 }]
        };
        const mockOrderData = [mockOrder];
        const mockExpectedOrder = {
            ...mockOrder,
            expire: true
        };
        (checkExpirationPayments as jest.Mock).mockImplementation(() => 2);
        (searchProductById as jest.Mock).mockResolvedValue(productsToReturn);
        (updateStockProducts as jest.Mock).mockResolvedValue(true);
        mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
        (mockOrder.updateExpire as jest.Mock).mockImplementation((value) => {
            mockExpectedOrder.expire = value;
        });
        mockOrderRepo.save.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(orderService.checkExpirationOrders(mockOrderData as any)).rejects.toThrow(error);
        expect(checkExpirationPayments).toHaveBeenCalledWith(mockOrder.created);
        expect(searchProductById).toHaveBeenCalledWith(mockOrder.products[0].productId);
        expect(updateStockProducts).toHaveBeenCalledWith([productsToReturn], "add");
        expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(mockOrder.userId, mockOrder.orderId);
        expect(mockOrder.updateExpire).toHaveBeenCalledWith(true);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })
})

