import { AuthRepository } from "repositories/authRepository";
import { Auth } from "models/auth";

describe("test in method getAuth", () => {
    const userId = "userId001";
    const authData = {
        userId: "user123",
        email: "test@example.com",
        code: 123456,
    };
    const mockDocs = {
        id: userId,
        data: () => authData
    };

    it("should return the Auth data", async () => {
        const mockDoc = {
            empty: false,
            docs: [mockDocs]
        };
        const repo = new AuthRepository() as any;
        repo.authCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockDoc),
            }),
        };
        const auth = await repo.getAuth(userId);
        expect(auth).toBeInstanceOf(Auth);
        expect(auth.id).toBe(userId);
        expect(auth.data).toEqual(authData as any);
    })

    it("should throw an error when obtaining the document, the empty property is true", async () => {
        const error = new Error("el userId ingresado no coincide con los registros de la db");
        const mockDoc = {
            empty: true,
            docs: [mockDocs]
        };
        const repo = new AuthRepository() as any;
        repo.authCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.getAuth(userId)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("hubo un error en la busqueda:", error.message);
        consoleSpy.mockRestore();
    })
})