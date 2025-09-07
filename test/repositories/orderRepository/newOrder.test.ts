import { OrderRepository } from "repositories/orderRepository"
import { Order } from "models/order"

describe("test in method newOrder", () => {
    const userId = "userTest";
    const orderId = "order001";
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
    it("should create a newOrder", async () => {
        const mockAdd = jest.fn().mockResolvedValue(data);
        const repo = new OrderRepository as any;
        repo.orderCollection = {
            add: mockAdd
        };
        const result = await repo.newOrder(data);
        expect(result).toBeInstanceOf(Order);
        expect(mockAdd).toHaveBeenCalledWith(data);
        console.log("datos",result.data,data)
        expect(result.data).toEqual(data);
    })

    it("should throw an error when the data cannot be added when creating newOrder", async () => {
        const error = new Error("Hubo un problema al agregar la data");
        const mockAdd = jest.fn().mockRejectedValue(error);
        const repo = new OrderRepository() as any;
        repo.orderCollection = {
            add: mockAdd
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.newOrder(data)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo crear una nueva orden:", error.message);
        expect(mockAdd).toHaveBeenCalledWith(data);
        consoleSpy.mockRestore();
    })
})