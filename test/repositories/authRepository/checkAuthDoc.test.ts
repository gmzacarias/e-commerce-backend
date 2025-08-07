import { AuthRepository } from "repositories/authRepository"

describe("test in method checkAuthDoc", () => {
    const userId = "userId001";
    const authData = {
        userId: userId,
        email: "test@example.com",
        code: 123456,
    };
   
    it("should return true if the user and document id are associated", async () => {
        const mockGetDoc = {
            exists: true,
            data: () => authData,
        };
        const repo = new AuthRepository() as any
        repo.authCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockGetDoc),
            }),
        };
        const result = await repo.checkAuthDoc("docId1234", userId);
        expect(result).toBe(true);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este id");
        const mockGetDoc = {
            exists: false,
            data: () => { },
        };
        const repo = new AuthRepository() as any
        repo.authCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockGetDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.checkAuthDoc("docId1234", userId)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener el documento:", error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when userId does not match", async () => {
        const error = new Error("el usuario no tiene acceso");
        const mockGetDoc = {
            exists: true,
            data: () => authData,
        };
        const repo = new AuthRepository() as any
        repo.authCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockGetDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.checkAuthDoc("docId1234", "userId003")).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener el documento:", error.message);
        consoleSpy.mockRestore();
    })
})
