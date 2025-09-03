import { UserRepository } from "repositories/userRepository"

describe("test in method getUser", () => {
    const data = {
        userName: "userTest",
        email: "userTest@email.com",
        phoneNumber: "1234567890",
        cart: [],
        address: {}
    };
    it("should return the User Data", async () => {
        const mockResult = {
            id: undefined,
            data: data
        }
        const repo = new UserRepository() as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockResolvedValue(mockResult);
        const result = await repo.getUser("userId001");
        expect(getUserDocSpy).toHaveBeenCalledWith("userId001");
        expect(result).toEqual(mockResult);
    })

    it("should throw an error when obtaining the document,the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este usuario");
        const repo = new UserRepository() as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getUser("userId001")).rejects.toThrow(error);
        expect(getUserDocSpy).toHaveBeenCalledWith("userId001");
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener los datos del usuario:", error.message);
        consoleSpy.mockRestore();
    })
})