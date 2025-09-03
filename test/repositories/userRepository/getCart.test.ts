import { UserRepository } from "repositories/userRepository"

describe("test in method getCart", () => {
    it("should return the shopping cart data associated with the userId", async () => {
        const mockProductData = [{
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
        const data = {
            userName: "userTest",
            email: "userTest@email.com",
            phoneNumber: "1234567890",
            cart: mockProductData,
            address: {}
        };
        const mockResult = {
            id: undefined,
            data: data
        };
        const repo = new UserRepository() as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockResolvedValue(mockResult);
        const result = await repo.getCart("userId001");
        expect(getUserDocSpy).toHaveBeenCalledWith("userId001");
        expect(result).toEqual(mockResult.data.cart);
    })

    it("should return an empty array if the shopping cart has no data", async () => {
        const data = {
            userName: "userTest",
            email: "userTest@email.com",
            phoneNumber: "1234567890",
            cart: [],
            address: {}
        };
        const mockResult = {
            id: undefined,
            data: data
        };
        const repo = new UserRepository() as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockResolvedValue(mockResult);
        const result = await repo.getCart("userId001");
        expect(getUserDocSpy).toHaveBeenCalledWith("userId001");
        expect(result).toEqual(mockResult.data.cart);
    })

    it("should throw an error when obtaining the document,the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este usuario");
        const repo = new UserRepository() as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getCart("userId001")).rejects.toThrow(error);
        expect(getUserDocSpy).toHaveBeenCalledWith("userId001");
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener los datos del carrito del usuario:", error.message);
        consoleSpy.mockRestore();
    })
})