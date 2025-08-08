import { AuthRepository } from "repositories/authRepository";
import { Auth } from "models/auth";

describe("test in method findByCode", () => {
    const code = 123456;
    const authData = {
        userId: "user123",
        email: "test@example.com",
        code: code,
    };
    const mockDocs = {
        id: "user123",
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
        const auth = await repo.findByCode(code);
        expect(auth).toBeInstanceOf(Auth);
        expect(auth.data).toEqual(authData as any);
    })

    it("should throw an error when obtaining the document, the empty property is true", async () => {
        const error = new Error("el code ingresado no coincide con los registros de la db");
        const mockDoc = {
            empty: true,
            docs: []
        };
        const repo = new AuthRepository() as any;
        repo.authCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockDoc),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.findByCode(code)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("hubo un error en la busqueda:", error.message);
        consoleSpy.mockRestore();
    })
})