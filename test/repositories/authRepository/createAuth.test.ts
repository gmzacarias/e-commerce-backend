import { AuthRepository } from "repositories/authRepository"
import { Auth } from "models/auth"

describe("test in method createAuth", () => {
    it("should create a newAuth", async () => {
        const mockAdd = jest.fn().mockResolvedValue({ id: "user123" });
        const repo = new AuthRepository() as any;
        repo.authCollection = {
            add: mockAdd
        };
        const data = {
            userId: "user123",
            email: "test@example.com",
            code: 123456,
        };
        const auth = await repo.createAuth(data);
        expect(auth.data).toEqual(data);
        expect(auth).toBeInstanceOf(Auth);
        expect(mockAdd).toHaveBeenCalledWith(data);
    })

    it("should throw an error when the data cannot be added when creating newAuth", async () => {
        const error = new Error("Hubo un problema al agregar la data");
        const mockAdd = jest.fn().mockRejectedValue(error);
        const repo = new AuthRepository() as any;
        repo.authCollection = {
            add: mockAdd
        };
        const data = {
            userId: "user123",
            email: "test@example.com",
            code: 123456,
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.createAuth(data)).rejects.toThrow(error);
        expect(mockAdd).toHaveBeenCalledWith(data);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo crear un nuevo auth:", error.message);
        consoleSpy.mockRestore();
    })
})