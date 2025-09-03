import { UserRepository } from "repositories/userRepository"
import { User } from "models/user"

describe("test in method createUser", () => {
    it("should create a newUser", async () => {
        const data = {
            userName: "userTest",
            email: "userTest@email.com",
            phoneNumber: "1234567890",
            cart: [],
            address: {}
        };
        const mockAdd = jest.fn().mockResolvedValue(data);
        const repo = new UserRepository as any;
        repo.userCollection = {
            add: mockAdd
        };
        const result = await repo.createUser(data);
        expect(result.data).toEqual(data);
        expect(result).toBeInstanceOf(User);
        expect(mockAdd).toHaveBeenCalledWith(data);
    })

    it("should throw an error when the data cannot be added when creating newUser", async () => {
        const error = new Error("Hubo un problema al agregar la data");
        const data = {
            userName: "userTest",
            email: "userTest@email.com",
            phoneNumber: "1234567890",
            cart: [],
            address: {}
        };
        const mockAdd = jest.fn().mockRejectedValue(error);
        const repo = new UserRepository() as any;
        repo.userCollection = {
            add: mockAdd
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.createUser(data)).rejects.toThrow(error);
        expect(mockAdd).toHaveBeenCalledWith(data);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo crear un nuevo user:", error.message);
        consoleSpy.mockRestore();
    })
})