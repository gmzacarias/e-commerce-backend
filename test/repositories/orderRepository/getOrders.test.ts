import { OrderRepository } from "repositories/orderRepository";

describe("test in method getOrders", () => {
    const userId = "userId001";
    const data = [{
        userId: userId,
        products: [],
        status: "pending",
        totalPrice: 0,
        additionalInfo: "",
        url: "http://paid.com/1234",
        orderId: "order001",
        created: new Date(),
        payment: null,
        expire: false,
    },
    {
        userId: userId,
        products: [],
        status: "pending",
        totalPrice: 0,
        additionalInfo: "",
        url: "http://paid.com/1234",
        orderId: "order002",
        created: new Date(),
        payment: null,
        expire: false,
    }];
    it("should return the orders data", async () => {
        const mockOrders = [
            {
                id: data[0].orderId,
                data: () => data[0]
            },
            {
                id: data[1].orderId,
                data: () => data[1]
            }
        ];
        const mockDocs = {
            empty: false,
            docs: mockOrders
        };
        const expectedResult = data;
        const repo = new OrderRepository() as any;
        repo.orderCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockDocs)
            }),
        };
        const result = await repo.getOrders(userId);
        expect(result).toEqual(expectedResult);
    })

    it("should return an empty array if the empty property is true", async () => {
        const mockDocs = {
            empty: true,
            docs: []
        };
        const repo = new OrderRepository() as any;
        repo.orderCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockDocs),
            }),
        };
        const result = await repo.getOrders(userId);
        expect(result).toEqual([]);
    })

    it("should return an error when the orders associated with the userId cannot be obtained", async () => {
        const error = new Error("el usuario no existe");
        const repo = new OrderRepository() as any;
        repo.orderCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockRejectedValue(error),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getOrders(userId)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener las ordenes:", error.message);
        consoleSpy.mockRestore();
    })
})