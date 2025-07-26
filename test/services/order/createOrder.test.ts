import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { formatProductsForOrder, calcTotalPrice, hasStock } from "utils/productsUtils"
import { updateStockProducts } from "services/algolia"

jest.mock("utils/productsUtils", () => ({
    formatProductsForOrder: jest.fn().mockReturnValue("mock-order-data"),
    calcTotalPrice: jest.fn().mockReturnValue("mock-total-price"),
    hasStock: jest.fn().mockReturnValue("mock-product-data"),
}))

jest.mock("services/algolia", () => ({
    updateStockProducts: jest.fn().mockReturnValue("mock-update-data"),
}))

describe("test in method createOrder", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            newOrder: jest.fn(),
        }

        mockUserRepo = {
            getUser: jest.fn(),
        }

        mockCartService = {
            getCartData: jest.fn(),
        }

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should create an order and update the stock.", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const userId = "user001";
        const info = "additional info";

        const mockCartData = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200,
            stock: 5,
            totalPrice: 200
        }]

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }]

        const mockOrder = {
            orderId: null,
            userId: userId,
            products: mockProducts,
            status: "pending",
            totalPrice: mockCartData[0].totalPrice,
            url: null,
            additionalInfo: info,
            created: new Date('2025-06-29T20:00:00Z'),
            payment: null,
            expire: false,
        };

        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockReturnValue(mockCartData);
        (formatProductsForOrder as jest.Mock).mockReturnValue(mockProducts);
        (calcTotalPrice as jest.Mock).mockReturnValue(mockCartData[0].totalPrice);
        mockOrderRepo.newOrder.mockResolvedValue(mockOrder as any);
        (updateStockProducts as jest.Mock).mockResolvedValue(
            mockCartData.map((item) => ({
                ...item,
                stock: item.stock - item.quantity,
            }))
        );

        const result = await orderService.createOrder(userId, info);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
        expect(formatProductsForOrder).toHaveBeenCalledWith(mockCartData);
        expect(calcTotalPrice).toHaveBeenCalledWith(mockCartData);
        expect(mockOrderRepo.newOrder).toHaveBeenCalledWith(mockOrder);
        expect(updateStockProducts).toHaveBeenCalledWith(mockCartData);
        expect(result).toEqual(mockOrder);
    })

    it("should create an order without additional info and update the stock.", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const userId = "user001";
        const mockCartData = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200,
            stock: 5,
            totalPrice: 200
        }]

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }]

        const mockOrder = {
            orderId: null,
            userId: userId,
            products: mockProducts,
            status: "pending",
            totalPrice: mockCartData[0].totalPrice,
            url: null,
            additionalInfo: null,
            created: new Date('2025-06-29T20:00:00Z'),
            payment: null,
            expire: false,
        };

        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockReturnValue(mockCartData);
        (formatProductsForOrder as jest.Mock).mockReturnValue(mockProducts);
        (calcTotalPrice as jest.Mock).mockReturnValue(mockCartData[0].totalPrice);
        mockOrderRepo.newOrder.mockResolvedValue(mockOrder as any);
        (updateStockProducts as jest.Mock).mockResolvedValue(
            mockCartData.map((item) => ({
                ...item,
                stock: item.stock - item.quantity,
            }))
        );

        const result = await orderService.createOrder(userId);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
        expect(formatProductsForOrder).toHaveBeenCalledWith(mockCartData);
        expect(calcTotalPrice).toHaveBeenCalledWith(mockCartData);
        expect(mockOrderRepo.newOrder).toHaveBeenCalledWith(mockOrder);
        expect(updateStockProducts).toHaveBeenCalledWith(mockCartData);
        expect(result).toEqual(mockOrder);
    })

    it("should throw an error if getUser fails in createOrder", async () => {
        const error = new Error("No hay datos relacionados al userId");
        mockUserRepo.getUser.mockRejectedValue(error);
        await expect(orderService.createOrder("user002")).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user002");
    })

    it("should throw an error if getCartData fails in createOrder", async () => {
        const error = new Error("No hay datos en el carrito de compras");
        const userId = "user001";
        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockRejectedValue(error);
        await expect(orderService.createOrder(userId)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
    })


    it("should throw an error if hasStock has out of stock products", async () => {
        const error = new Error("Hay productos sin stock");
        const userId = "user001";

        const mockCartData = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 3,
            price: 200,
            stock: 0,
            totalPrice: 600
        }];

        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createOrder(userId)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
    })

    it("should throw an error when hasStock has no products to check", async () => {
        const error = new Error("No hay productos para chequear el stock");
        const userId = "user001";
        const mockCartData = [];
        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createOrder(userId)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
    })

    it("should throw an error when formatProductsForOrder fails", async () => {
        const error = new Error("No hay productos");
        const userId = "user001";
        const mockCartData = [];
        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockReturnValue(mockCartData);
        (formatProductsForOrder as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createOrder(userId)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
        expect(formatProductsForOrder).toHaveBeenCalledWith(mockCartData);
    })

    it("should throw an error when calcToPrice fails", async () => {
        const error = new Error("No hay productos");
        const userId = "user001";
        const mockCartData = [];
        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }]

        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockReturnValue(mockCartData);
        (formatProductsForOrder as jest.Mock).mockReturnValue(mockProducts);
        (calcTotalPrice as jest.Mock).mockImplementation(() => {
            throw error
        });

        await expect(orderService.createOrder(userId)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
        expect(formatProductsForOrder).toHaveBeenCalledWith(mockCartData);
        expect(calcTotalPrice).toHaveBeenCalledWith(mockCartData);
    })


    it("should throw an error when newOrder cannot create a new order", async () => {
        const error = new Error("Hubo un error al crear una nueva orden");
        const userId = "user001";
        const info = "additional info";

        const mockCartData = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200,
            stock: 5,
            totalPrice: 200
        }]

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }]

        const mockOrder = {
            orderId: null,
            userId: userId,
            products: mockProducts,
            status: "pending",
            totalPrice: mockCartData[0].totalPrice,
            url: null,
            additionalInfo: info,
            created: new Date('2025-06-29T20:00:00Z'),
            payment: null,
            expire: false,
        };

        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockReturnValue(mockCartData);
        (formatProductsForOrder as jest.Mock).mockReturnValue(mockProducts);
        (calcTotalPrice as jest.Mock).mockReturnValue(mockCartData[0].totalPrice);
        mockOrderRepo.newOrder.mockRejectedValue(error);

        await expect(orderService.createOrder(userId, info)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
        expect(formatProductsForOrder).toHaveBeenCalledWith(mockCartData);
        expect(calcTotalPrice).toHaveBeenCalledWith(mockCartData);
        expect(mockOrderRepo.newOrder).toHaveBeenCalledWith(mockOrder);
    })

    it("should an error when updateStockProducts fails", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const error = new Error("No hay productos");
        const userId = "user001";
        const info = "additional info";

        const mockCartData = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200,
            stock: 5,
            totalPrice: 200
        }]

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }]

        const mockOrder = {
            orderId: null,
            userId: userId,
            products: mockProducts,
            status: "pending",
            totalPrice: mockCartData[0].totalPrice,
            url: null,
            additionalInfo: info,
            created: new Date('2025-06-29T20:00:00Z'),
            payment: null,
            expire: false,
        };

        mockUserRepo.getUser.mockResolvedValue({ id: userId } as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (hasStock as jest.Mock).mockReturnValue(mockCartData);
        (formatProductsForOrder as jest.Mock).mockReturnValue(mockProducts);
        (calcTotalPrice as jest.Mock).mockReturnValue(mockCartData[0].totalPrice);
        mockOrderRepo.newOrder.mockResolvedValue(mockOrder as any);
        (updateStockProducts as jest.Mock).mockImplementation(() => {
            throw error
        }
        );

        await expect(orderService.createOrder(userId, info)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(hasStock).toHaveBeenCalledWith(mockCartData);
        expect(formatProductsForOrder).toHaveBeenCalledWith(mockCartData);
        expect(calcTotalPrice).toHaveBeenCalledWith(mockCartData);
        expect(mockOrderRepo.newOrder).toHaveBeenCalledWith(mockOrder);
        expect(updateStockProducts).toHaveBeenCalledWith(mockCartData);
    })
})