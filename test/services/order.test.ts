import { describe, expect } from "@jest/globals"
import { OrderService } from "../../services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { CartService } from "../../services/cart"
import { formatProductsForOrder, calcTotalPrice, formatItemsForPreference, hasStock } from "utils/cart"
import { checkExpirationPayments, formatExpireDateForPreference, formatDateFirebase } from "../../services/dateFns"
import { updateStockProducts } from "../../services/algolia"
import { createPreference, getMerchantOrderId, getPayment } from "../../services/mercadopago"
import { saleAlert, purchaseAlert } from "../../services/sendgrid"
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
    let mockCartService: jest.Mocked<Partial<CartService>>
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

        mockCartService = {
            getCartData: jest.fn(),
            reset: jest.fn(),
        }

        orderService = new OrderService(mockOrderRepo, mockUserRepo, mockCartService)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe("test in method checkExpirationOrders", () => {
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


    describe("test in method getMyOrders", () => {
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

            jest.spyOn(orderService, "checkExpirationOrders").mockResolvedValue(true);
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


    describe("", () => {
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


            mockOrderRepo.getOrderDoc.mockReturnValue(mockOrder as any);
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

    describe("test in method createOrder", () => {
        it("should create an order", async () => {
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

    describe("test in method createPreference", () => {
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

    describe("test in method updateOrder", () => {
        it("should update order and return an order", async () => {
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order001"
            };
            const mockOrder = {
                id: "order001",
                data: {
                    orderId: "orderId001",
                    userId: userId,
                    products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                    status: "paid",
                    totalPrice: 20000,
                    url: "https://mp.com.ar/paid/28182128",
                    additionalInfo: "info adicional",
                    created: new Date('2025-06-29T20:00:00Z'),
                    payment: null,
                    expire: false,
                },
                updateStatus: jest.fn()
            };

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
                    cart: [],
                }
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            mockUserRepo.getUser.mockResolvedValue(mockUser as any);
            (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
            mockOrderRepo.save.mockResolvedValue(true);
            (purchaseAlert as jest.Mock).mockResolvedValue("Email de aviso de compra enviado");
            (saleAlert as jest.Mock).mockResolvedValue("Email de aviso de venta enviado");

            const result = await (orderService.UpdateOrder(userId, mockParams.topic, mockParams.id));
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
            expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
            expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
            expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
            expect(purchaseAlert).toHaveBeenCalledWith(mockUser.data.email, mockUser.data.userName, mockOrder.data);
            expect(saleAlert).toHaveBeenCalledWith(mockUser.data, mockOrder.data);
            expect(result).toBe(mockOrder);
        })

        it("should throw an error when topic is different from merchant_order", async () => {
            const userId = "user001";
            const mockParams = {
                topic: "payment",
                id: "9292929"
            };
            const result = await orderService.UpdateOrder(userId, mockParams.topic, mockParams.id);
            expect(result).toBeNull();
        })

        it("should throw an error when getMerchantOrderId is called with an id invalid", async () => {
            const error = new Error("El id ingresado es invalido");
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };

            (getMerchantOrderId as jest.Mock).mockRejectedValue(error);
            await expect(orderService.UpdateOrder(userId, mockParams.topic, mockParams.id)).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
        })

        it("should throw an error when order_status is differente from paid", async () => {
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "pending",
                external_reference: "order001"
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            const result = await orderService.UpdateOrder(userId, mockParams.topic, mockParams.id);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(result).toBeNull();
        })

        it("should throw an error when getOrderDoc does not return any data ", async () => {
            const error = new Error("No hay ordenes relacionadas al orderId");
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order005"
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockRejectedValue(error);
            await expect(orderService.UpdateOrder(userId, mockParams.topic, mockParams.id)).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
        })

        it("should throw an error when getUser does not return any data", async () => {
            const error = new Error("No hay datos relacionadas al userId");
            const userId = "user005";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order001"
            };
            const mockOrder = {
                id: "order001",
                data: {
                    orderId: "orderId001",
                    userId: "user001",
                    products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                    status: "paid",
                    totalPrice: 20000,
                    url: "https://mp.com.ar/paid/28182128",
                    additionalInfo: "info adicional",
                    created: new Date('2025-06-29T20:00:00Z'),
                    payment: null,
                    expire: false,
                },
                updateStatus: jest.fn()
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            mockUserRepo.getUser.mockRejectedValue(error);
            await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
            expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
        })

        it("should throw an error when updating the order fails", async () => {
            const error = new Error("No se pudo actualizar el estado de la orden");
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order001"
            };
            const mockOrder = {
                id: "order001",
                data: {
                    orderId: "orderId001",
                    userId: userId,
                    products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                    status: "paid",
                    totalPrice: 20000,
                    url: "https://mp.com.ar/paid/28182128",
                    additionalInfo: "info adicional",
                    created: new Date('2025-06-29T20:00:00Z'),
                    payment: null,
                    expire: false,
                },
                updateStatus: jest.fn()
            };

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
                    cart: [],
                }
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            mockUserRepo.getUser.mockResolvedValue(mockUser as any);
            (mockOrder.updateStatus as jest.Mock).mockImplementation(() => {
                throw error
            });

            await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
            expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
            expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
        })

        it("should throw an error when saving the order fails ", async () => {
            const error = new Error("No se pudo guardar la orden");
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order001"
            };
            const mockOrder = {
                id: "order001",
                data: {
                    orderId: "orderId001",
                    userId: userId,
                    products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                    status: "paid",
                    totalPrice: 20000,
                    url: "https://mp.com.ar/paid/28182128",
                    additionalInfo: "info adicional",
                    created: new Date('2025-06-29T20:00:00Z'),
                    payment: null,
                    expire: false,
                },
                updateStatus: jest.fn()
            };

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
                    cart: [],
                }
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            mockUserRepo.getUser.mockResolvedValue(mockUser as any);
            (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
            mockOrderRepo.save.mockRejectedValue(error);

            await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
            expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
            expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
            expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
        })

        it("should throw an error when the purchase alert email fails to send ", async () => {
            const error = new Error("No se pudo enviar la alerta de compra");
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order001"
            };
            const mockOrder = {
                id: "order001",
                data: {
                    orderId: "orderId001",
                    userId: userId,
                    products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                    status: "paid",
                    totalPrice: 20000,
                    url: "https://mp.com.ar/paid/28182128",
                    additionalInfo: "info adicional",
                    created: new Date('2025-06-29T20:00:00Z'),
                    payment: null,
                    expire: false,
                },
                updateStatus: jest.fn()
            };

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
                    cart: [],
                }
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            mockUserRepo.getUser.mockResolvedValue(mockUser as any);
            (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
            mockOrderRepo.save.mockResolvedValue(true);
            (purchaseAlert as jest.Mock).mockRejectedValue(error);

            await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
            expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
            expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
            expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
            expect(purchaseAlert).toHaveBeenCalledWith(mockUser.data.email, mockUser.data.userName, mockOrder.data);
        })

        it("should throw an error when the sale alert email fails to send", async () => {
            const error = new Error("No se pudo enviar la alerta de venta");
            const userId = "user001";
            const mockParams = {
                topic: "merchant_order",
                id: "9292929"
            };
            const mockMerchantOrder = {
                order_status: "paid",
                external_reference: "order001"
            };
            const mockOrder = {
                id: "order001",
                data: {
                    orderId: "orderId001",
                    userId: userId,
                    products: [{ productId: "productId25", price: 20000, quantity: 1 }],
                    status: "paid",
                    totalPrice: 20000,
                    url: "https://mp.com.ar/paid/28182128",
                    additionalInfo: "info adicional",
                    created: new Date('2025-06-29T20:00:00Z'),
                    payment: null,
                    expire: false,
                },
                updateStatus: jest.fn()
            };

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
                    cart: [],
                }
            };

            (getMerchantOrderId as jest.Mock).mockResolvedValue(mockMerchantOrder);
            mockOrderRepo.getOrderDoc.mockResolvedValue(mockOrder as any);
            mockUserRepo.getUser.mockResolvedValue(mockUser as any);
            (mockOrder.updateStatus as jest.Mock).mockReturnValue(true);
            mockOrderRepo.save.mockResolvedValue(true);
            (purchaseAlert as jest.Mock).mockResolvedValue("Email de aviso de compra enviado");
            (saleAlert as jest.Mock).mockRejectedValue(error);

            await expect((orderService.UpdateOrder(userId, mockParams.topic, mockParams.id))).rejects.toThrow(error);
            expect(getMerchantOrderId).toHaveBeenCalledWith({ merchantOrderId: mockParams.id });
            expect(mockOrderRepo.getOrderDoc).toHaveBeenCalledWith(userId, mockMerchantOrder.external_reference);
            expect(mockUserRepo.getUser).toHaveBeenCalledWith(userId);
            expect(mockOrder.updateStatus).toHaveBeenCalledWith(mockMerchantOrder.order_status);
            expect(mockOrderRepo.save).toHaveBeenCalledWith(mockOrder);
            expect(purchaseAlert).toHaveBeenCalledWith(mockUser.data.email, mockUser.data.userName, mockOrder.data);
            expect(saleAlert).toHaveBeenCalledWith(mockUser.data, mockOrder.data);
        })
    })

})

