import { UserRepository } from "repositories/userRepository"

describe("test in method getUserDoc", () => {
    const userId = "userTest";
    const data = {
        userName: userId,
        email: "userTest@email.com",
        phoneNumber: "1234567890",
        cart: [],
        address: {}
    }

    it("should return a document associated with the userId", async () => {
        const mockUserDoc = {
            exists: true,
            data: () => data,
        };
        const mockResult = {
            id: undefined,
            data: data
        }
        const repo = new UserRepository() as any
        repo.userCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockUserDoc),
            }),
        };
        const result = await repo.getUserDoc("userTest");
        expect(result).toEqual(mockResult);
    })

    it("should throw an error when userId does not match", async () => {
        const error = new Error("no existe un documento asociado a este usuario");
        const mockUserDoc = {
            exists: false,
            data: () => { },
        };
        const repo = new UserRepository() as any
        repo.userCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockUserDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getUserDoc("userTest")).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener el documento:", error.message);
        consoleSpy.mockRestore();
    })
})