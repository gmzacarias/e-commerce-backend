import { describe, expect } from "@jest/globals"
import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "services/cart"
import { formatItemsForPreference } from "utils/productsUtils"
import { formatExpireDateForPreference } from "services/dateFns"

import { createPreference } from "services/mercadopago"

import { getBaseUrl } from "utils/getBaseUrl"

jest.mock("utils/cart", () => ({
    formatItemsForPreference: jest.fn().mockReturnValue("mock-items-data"),
}))

jest.mock("services/dateFns", () => ({
    formatExpireDateForPreference: jest.fn().mockReturnValue("mock-string"),
}))

jest.mock("services/mercadopago", () => ({
    createPreference: jest.fn().mockReturnValue("mock-new-Preference"),
}))

jest.mock("utils/getBaseUrl", () => ({
    getBaseUrl: jest.fn().mockReturnValue("mock-url")
}))

describe("test in method createPreference", () => {
    let orderService: OrderService
    let mockCartService: jest.Mocked<Partial<CartService>>
    let mockOrderRepo: jest.Mocked<Partial<OrderRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockOrderRepo = {
            save: jest.fn(),
        }

        mockUserRepo = {
            getUser: jest.fn(),
        }

        mockCartService = {
            getCartData: jest.fn(),
            reset: jest.fn(),
        }

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    it("should create preference and return url for paid", async () => {
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            setOrderId: jest.fn(),
            setUrl: jest.fn(),
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const mockUrlData = {
            notificationUrl: "http://notification.com",
            successUrl: "http://notification.com",
            failureUrl: "http://notification.com",
            pendingUrl: "http://notification.com",

        };

        const mockCreatePreference = {
            body: {
                external_reference: mockOrder.data.orderId,
                notification_url: `${mockUrlData.notificationUrl}`,
                items: mockItems,
                payer: {
                    name: `${mockUser.data.userName}`,
                    email: `${mockUser.data.email}`,
                    phone: {
                        number: `${mockUser.data.phoneNumber}`
                    }
                },
                back_urls: {
                    success: `${mockUrlData.successUrl}`,
                    failure: `${mockUrlData.failureUrl}`,
                    pending: `${mockUrlData.pendingUrl}`
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDateForPreference,
            }
        }

        const mockNewPreference = {
            init_point: "https://mp.com.ar/paid/28182128"
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            return mockUrlData
        });
        (createPreference as jest.Mock).mockResolvedValue(mockNewPreference);
        (mockOrder.setOrderId as jest.Mock).mockReturnValue(true);
        (mockOrder.setUrl as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockResolvedValue(true);
        mockCartService.reset.mockResolvedValue(mockProducts as any)

        const result = await orderService.createPreference(userId, additionalInfo);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
        expect(createPreference).toHaveBeenCalledWith(mockCreatePreference);
        expect(mockOrder.setOrderId).toHaveBeenCalledWith(mockOrder.id);
        expect(mockOrder.setUrl).toHaveBeenCalledWith(mockNewPreference.init_point);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(mockCartService.reset).toHaveBeenCalledWith(userId);
        expect(result).toEqual({ url: mockNewPreference.init_point });
    })

    it("should throw an error when createOrder fails", async () => {
        const error = new Error("No existe el userId");
        const userId = "user002";
        const additionalInfo = "info adicional";
        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockRejectedValue(error);
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
    })

    it("should throw an error when getCartData has no products", async () => {
        const error = new Error("No existen productos en el carrito de compras");
        const userId = "user001";
        const additionalInfo = "info adicional";

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [],
                status: "pending",
                totalPrice: 0,
                url: null,
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockRejectedValue(error);
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
    })

    it("should throw an error when formatItemsForPreference has no product to format", async () => {
        const error = new Error("No existen productos en el carrito de compras");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const mockCartData = [];
        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: [],
                status: "pending",
                totalPrice: 0,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
    })

    it("should throw an error when getUser does not return any data", async () => {
        const error = new Error("No existen datos relacionados al userId");
        const userId = "user001";
        const additionalInfo = "info adicional";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockImplementation(() => {
            throw error
        });
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
    })

    it("should throw an error when formatItemsForPreference is unable to create a data", async () => {
        const error = new Error("Hubo un error al formatear la fecha");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
    })

    it("should throw an error if getBaseUrl returns no data", async () => {
        const error = new Error("Hubo un error al obtener las urls");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
    })

    it("should throw an error when createPreference is unable to create a preference", async () => {
        const error = new Error("Hubo un error al crear la preferencia");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const mockUrlData = {
            notificationUrl: "http://notification.com",
            successUrl: "http://notification.com",
            failureUrl: "http://notification.com",
            pendingUrl: "http://notification.com",

        };

        const mockCreatePreference = {
            body: {
                external_reference: mockOrder.data.orderId,
                notification_url: `${mockUrlData.notificationUrl}`,
                items: mockItems,
                payer: {
                    name: `${mockUser.data.userName}`,
                    email: `${mockUser.data.email}`,
                    phone: {
                        number: `${mockUser.data.phoneNumber}`
                    }
                },
                back_urls: {
                    success: `${mockUrlData.successUrl}`,
                    failure: `${mockUrlData.failureUrl}`,
                    pending: `${mockUrlData.pendingUrl}`
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDateForPreference,
            }
        }

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            return mockUrlData
        });
        (createPreference as jest.Mock).mockRejectedValue(error);
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
        expect(createPreference).toHaveBeenCalledWith(mockCreatePreference);
    })

    it("should throw an error when saving the orderId fails", async () => {
        const error = new Error("Hubo un error al guardar la orderId");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            setOrderId: jest.fn(),
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const mockUrlData = {
            notificationUrl: "http://notification.com",
            successUrl: "http://notification.com",
            failureUrl: "http://notification.com",
            pendingUrl: "http://notification.com",

        };

        const mockCreatePreference = {
            body: {
                external_reference: mockOrder.data.orderId,
                notification_url: `${mockUrlData.notificationUrl}`,
                items: mockItems,
                payer: {
                    name: `${mockUser.data.userName}`,
                    email: `${mockUser.data.email}`,
                    phone: {
                        number: `${mockUser.data.phoneNumber}`
                    }
                },
                back_urls: {
                    success: `${mockUrlData.successUrl}`,
                    failure: `${mockUrlData.failureUrl}`,
                    pending: `${mockUrlData.pendingUrl}`
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDateForPreference,
            }
        }

        const mockNewPreference = {
            init_point: "https://mp.com.ar/paid/28182128"
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            return mockUrlData
        });
        (createPreference as jest.Mock).mockResolvedValue(mockNewPreference);
        (mockOrder.setOrderId as jest.Mock).mockImplementation(() => {
            throw error
        });
        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
        expect(createPreference).toHaveBeenCalledWith(mockCreatePreference);
        expect(mockOrder.setOrderId).toHaveBeenCalledWith(mockOrder.id);
    })

    it("should throw an error when saving the URL fails", async () => {
        const error = new Error("Hubo un error al guardar la url en la orden");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            setOrderId: jest.fn(),
            setUrl: jest.fn(),
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const mockUrlData = {
            notificationUrl: "http://notification.com",
            successUrl: "http://notification.com",
            failureUrl: "http://notification.com",
            pendingUrl: "http://notification.com",

        };

        const mockCreatePreference = {
            body: {
                external_reference: mockOrder.data.orderId,
                notification_url: `${mockUrlData.notificationUrl}`,
                items: mockItems,
                payer: {
                    name: `${mockUser.data.userName}`,
                    email: `${mockUser.data.email}`,
                    phone: {
                        number: `${mockUser.data.phoneNumber}`
                    }
                },
                back_urls: {
                    success: `${mockUrlData.successUrl}`,
                    failure: `${mockUrlData.failureUrl}`,
                    pending: `${mockUrlData.pendingUrl}`
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDateForPreference,
            }
        }

        const mockNewPreference = {
            init_point: "https://mp.com.ar/paid/28182128"
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            return mockUrlData
        });
        (createPreference as jest.Mock).mockResolvedValue(mockNewPreference);
        (mockOrder.setOrderId as jest.Mock).mockReturnValue(true);
        (mockOrder.setUrl as jest.Mock).mockImplementation(() => {
            throw error
        });

        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
        expect(createPreference).toHaveBeenCalledWith(mockCreatePreference);
        expect(mockOrder.setOrderId).toHaveBeenCalledWith(mockOrder.id);
        expect(mockOrder.setUrl).toHaveBeenCalledWith(mockNewPreference.init_point);
    })

    it("should throw an error when saving the order fails", async () => {
        const error = new Error("Hubo un error al guardar la orden");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            setOrderId: jest.fn(),
            setUrl: jest.fn(),
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const mockUrlData = {
            notificationUrl: "http://notification.com",
            successUrl: "http://notification.com",
            failureUrl: "http://notification.com",
            pendingUrl: "http://notification.com",

        };

        const mockCreatePreference = {
            body: {
                external_reference: mockOrder.data.orderId,
                notification_url: `${mockUrlData.notificationUrl}`,
                items: mockItems,
                payer: {
                    name: `${mockUser.data.userName}`,
                    email: `${mockUser.data.email}`,
                    phone: {
                        number: `${mockUser.data.phoneNumber}`
                    }
                },
                back_urls: {
                    success: `${mockUrlData.successUrl}`,
                    failure: `${mockUrlData.failureUrl}`,
                    pending: `${mockUrlData.pendingUrl}`
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDateForPreference,
            }
        }

        const mockNewPreference = {
            init_point: "https://mp.com.ar/paid/28182128"
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            return mockUrlData
        });
        (createPreference as jest.Mock).mockResolvedValue(mockNewPreference);
        (mockOrder.setOrderId as jest.Mock).mockReturnValue(true);
        (mockOrder.setUrl as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockRejectedValue(error);

        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
        expect(createPreference).toHaveBeenCalledWith(mockCreatePreference);
        expect(mockOrder.setOrderId).toHaveBeenCalledWith(mockOrder.id);
        expect(mockOrder.setUrl).toHaveBeenCalledWith(mockNewPreference.init_point);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
    })

    it("should throw an error if the cart reset fails", async () => {
        const error = new Error("Hubo un error al resetear el carrito de compras");
        const userId = "user001";
        const additionalInfo = "info adicional";
        const expireDateForPreference = "2025-07-04T19:12:45.123-03:00";

        const mockProducts = [{
            productId: "25",
            brand: "Samsung",
            familyModel: "Galaxy",
            model: "S 23",
            colour: "grey",
            photo: "http://imageProductId25.jpg",
            quantity: 1,
            price: 200
        }];

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
        }];

        const mockOrder = {
            id: "orderId001",
            data: {
                orderId: "orderId001",
                userId: userId,
                products: mockProducts,
                status: "pending",
                totalPrice: mockCartData[0].totalPrice,
                url: "https://mp.com.ar/paid/28182128",
                additionalInfo: additionalInfo,
                created: new Date('2025-06-29T20:00:00Z'),
                payment: null,
                expire: false,
            },
            setOrderId: jest.fn(),
            setUrl: jest.fn(),
        };

        const mockItems = [{
            id: `${mockCartData[0].productId}`,
            title: `${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model}`,
            description: `smartphone ${mockCartData[0].brand} ${mockCartData[0].familyModel} ${mockCartData[0].model} `,
            picture_url: mockCartData[0].photo,
            category_id: "Phones",
            quantity: mockCartData[0].quantity,
            currency_id: "ARS",
            unit_price: mockCartData[0].price
        }];

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
                cart: mockCartData,
            }
        };

        const mockUrlData = {
            notificationUrl: "http://notification.com",
            successUrl: "http://notification.com",
            failureUrl: "http://notification.com",
            pendingUrl: "http://notification.com",

        };

        const mockCreatePreference = {
            body: {
                external_reference: mockOrder.data.orderId,
                notification_url: `${mockUrlData.notificationUrl}`,
                items: mockItems,
                payer: {
                    name: `${mockUser.data.userName}`,
                    email: `${mockUser.data.email}`,
                    phone: {
                        number: `${mockUser.data.phoneNumber}`
                    }
                },
                back_urls: {
                    success: `${mockUrlData.successUrl}`,
                    failure: `${mockUrlData.failureUrl}`,
                    pending: `${mockUrlData.pendingUrl}`
                },
                expires: true,
                auto_return: "all",
                additional_info: additionalInfo,
                statement_descriptor: "MERCADOPAGO-SMARTSHOP",
                expiration_date_to: expireDateForPreference,
            }
        }

        const mockNewPreference = {
            init_point: "https://mp.com.ar/paid/28182128"
        };

        const createOrderSpy = jest.spyOn(orderService, "createOrder").mockResolvedValue(mockOrder as any);
        mockCartService.getCartData.mockResolvedValue(mockCartData as any);
        (formatItemsForPreference as jest.Mock).mockReturnValue(mockItems);
        mockUserRepo.getUser.mockReturnValue(mockUser as any);
        (formatExpireDateForPreference as jest.Mock).mockReturnValue(expireDateForPreference);
        (getBaseUrl as jest.Mock).mockImplementation(() => {
            return mockUrlData
        });
        (createPreference as jest.Mock).mockResolvedValue(mockNewPreference);
        (mockOrder.setOrderId as jest.Mock).mockReturnValue(true);
        (mockOrder.setUrl as jest.Mock).mockReturnValue(true);
        mockOrderRepo.save.mockResolvedValue(true);
        mockCartService.reset.mockRejectedValue(error);

        await expect(orderService.createPreference(userId, additionalInfo)).rejects.toThrow(error);
        expect(createOrderSpy).toHaveBeenCalledWith(userId, additionalInfo);
        expect(mockCartService.getCartData).toHaveBeenCalledWith(userId);
        expect(formatItemsForPreference).toHaveBeenCalledWith(mockCartData);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        expect(formatExpireDateForPreference).toHaveBeenCalled();
        expect(getBaseUrl).toHaveBeenCalled();
        expect(createPreference).toHaveBeenCalledWith(mockCreatePreference);
        expect(mockOrder.setOrderId).toHaveBeenCalledWith(mockOrder.id);
        expect(mockOrder.setUrl).toHaveBeenCalledWith(mockNewPreference.init_point);
        expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        expect(mockCartService.reset).toHaveBeenCalledWith(userId);
    })
})
