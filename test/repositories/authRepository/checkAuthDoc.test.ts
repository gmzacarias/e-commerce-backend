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
        const repo = setupRepoWithMockDoc({ exists: false });
        await expect(repo.checkAuthDoc("docId1234", "user123")).rejects.toThrow("no existe un documento asociado a este id");
    })

    it("should throw an error when userId does not match", async () => {
        const repo = setupRepoWithMockDoc(mockDoc(true, "user1234"));
        await expect(repo.checkAuthDoc("docId1234", "user1235")).rejects.toThrow("el usuario no tiene acceso");
    })
})
