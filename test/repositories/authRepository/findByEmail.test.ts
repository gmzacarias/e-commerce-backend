import { AuthRepository } from "repositories/authRepository"
import { Auth } from "models/auth"

describe("test in method findByEmail", () => {
    const email = "test@example.com";
    const authData = {
        userId: "userId001",
        email: email,
        code: 123456,
    };
    const mockDocs = {
        id: "userId001",
        data: () => authData
    };

    it("should search by email, and return the first document associated with that email.", async () => {
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
        const auth = await repo.findByEmail(email);
        expect(auth).toBeInstanceOf(Auth);
        expect(auth.data.email).toBe(email);
        expect(auth.data).toEqual(authData);
    })

    it("should return null if when executing , the empty property is true", async () => {
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
        const auth = await repo.findByEmail(email);
        expect(auth).toBe(null);
    })

    it("should throw an error when the search cannot be performed",async () => {
        const error = new Error("el userId ingresado no coincide con los registros de la db");
        const repo = new AuthRepository() as any;
        repo.authCollection = {
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockRejectedValue(error),
            }),
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.findByEmail(email)).rejects.toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("hubo un error en la busqueda:", error.message);
        consoleSpy.mockRestore();
    })
})