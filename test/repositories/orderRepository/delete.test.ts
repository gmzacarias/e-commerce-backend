import { OrderRepository } from "repositories/orderRepository"

describe("test in method delete", () => {
    const userId = "userId001";
    const orderId = "orderId001";
    it("should delete the order associated with the orderId", async () => {
        const repo = new OrderRepository as any;
        const getOrderDocSpy = jest.spyOn(repo, "getOrderDoc").mockResolvedValue(true);
        repo.orderCollection = {
            doc: jest.fn().mockReturnValue({
                delete: jest.fn().mockResolvedValue(true)
            })
        };
        const result = await repo.delete(userId, orderId);
        expect(getOrderDocSpy).toHaveBeenCalledWith(userId, orderId);
        expect(result).toBe(true);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a esta orden");
        const repo = new OrderRepository as any;
        const getOrderDocSpy = jest.spyOn(repo, "getOrderDoc").mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.delete(userId, orderId)).rejects.toThrow(error);
        expect(getOrderDocSpy).toHaveBeenCalledWith(userId, orderId);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo eliminar el documento:", error.message);
        consoleSpy.mockRestore();
    })
})