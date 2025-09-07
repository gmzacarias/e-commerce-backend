import { OrderRepository } from "repositories/orderRepository";
import { Order } from "models/order";

describe("test in method getOrderDoc", () => {
    const userId = "userTest";
    const orderId = "order001";
    it("should return a document associated with the orderId and userId", async () => {
        const data = {
            userId: userId,
            products: [],
            status: "pending",
            totalPrice: 0,
            additionalInfo: "",
            url: "http://paid.com/1234",
            orderId: orderId,
            created: new Date(),
            payment: null,
            expire: false,
        };
        const mockOrderDoc = {
            exists: true,
            id: orderId,
            data: () => data,
        };
        const repo = new OrderRepository() as any
        repo.orderCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockOrderDoc),
            }),
        };
        const result = await repo.getOrderDoc(userId, orderId);
        expect(result).toBeInstanceOf(Order);
        expect(result.id).toBe(orderId);
        expect(result.data).toEqual(data);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a esta orden");
        const mockOrderDoc = {
            exists: false,
            data: () => { },
        };
        const repo = new OrderRepository() as any
        repo.orderCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockOrderDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getOrderDoc(userId, orderId)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener la orden:", error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when userId does not match", async () => {
        const error = new Error("el usuario no tiene acceso a esta orden");
        const data = {
            userId: userId,
            products: [],
            status: "pending",
            totalPrice: 0,
            additionalInfo: "",
            url: "http://paid.com/1234",
            orderId: orderId,
            created: new Date(),
            payment: null,
            expire: false,
        };
        const mockGetDoc = {
            exists: true,
            data: () => data,
        };
        const repo = new OrderRepository() as any
        repo.orderCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockGetDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getOrderDoc(orderId, userId)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener la orden:", error.message);
        consoleSpy.mockRestore();
    })
})