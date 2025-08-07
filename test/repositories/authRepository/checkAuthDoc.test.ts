import { AuthRepository } from "repositories/authRepository"

describe("test in method checkAuthDoc", () => {
    const mockDoc = (exists: boolean, userId?: string) => ({
        exists,
        data: () => ({ userId }),
    });

    const setupRepoWithMockDoc = (mockedDoc: any): any => {
        const repo = new AuthRepository() as any
        repo.authCollection = {
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockedDoc),
            }),
        }
        return repo
    };

    it("should return true if the user and document id are associated", async () => {
        const repo = setupRepoWithMockDoc(mockDoc(true, "user123"));
        const result = await repo.checkAuthDoc("docId1234", "user123");
        expect(result).toBe(true);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este id");
        const repo = setupRepoWithMockDoc({ exists: false });
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.checkAuthDoc("docId1234", "user123")).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener el documento:", error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when userId does not match", async () => {
        const error = new Error("el usuario no tiene acceso");
        const repo = setupRepoWithMockDoc(mockDoc(true, "user1234"));
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.checkAuthDoc("docId1234", "user1235")).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo obtener el documento:", error.message);
        consoleSpy.mockRestore();
    })
})
