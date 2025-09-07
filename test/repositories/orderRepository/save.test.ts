import { OrderRepository } from "repositories/orderRepository"
import { Order} from "models/order"

describe("test in method save", () => {
    it("should update the order with the data received as parameters", async () => {
        const orderData = [{
            id: "orderId001",
            data: {
                userId: "userId001",
                products: [],
                status: "pending",
                totalPrice: 0,
                additionalInfo: "",
                url: "http://paid.com/1234",
                orderId: "orderId001",
                created: new Date(),
                payment: null,
                expire: false,
            }
        }];
        const repo = new OrderRepository as any;
        const getOrderDocSpy = jest.spyOn(repo, "getOrderDoc").mockResolvedValue(true);
        const updateMock = jest.fn().mockResolvedValue(true);
        repo.orderCollection = {
            doc: jest.fn().mockReturnValue({
                update: updateMock
            })
        };
        const data = new Order(orderData[0].id, orderData[0].data as any);
        const result = await repo.save(data);
        expect(getOrderDocSpy).toHaveBeenCalledWith(data.data.userId, data.id);
        expect(updateMock).toHaveBeenCalledWith(data.data);
        expect(result).toBe(true);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este id");
        const orderData = [{
            id: "orderId001",
            data: {
                userId: "userId001",
                products: [],
                status: "pending",
                totalPrice: 0,
                additionalInfo: "",
                url: "http://paid.com/1234",
                orderId: "orderId001",
                created: new Date(),
                payment: null,
                expire: false,
            }
        }];
        const repo = new OrderRepository as any;
        const getOrderDocSpy = jest.spyOn(repo, "getOrderDoc").mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.save(orderData[0])).rejects.toThrow(error);
        expect(getOrderDocSpy).toHaveBeenCalledWith(orderData[0].data.userId, orderData[0].id);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo actualizar el documento:", error.message);
        consoleSpy.mockRestore();
    })
})