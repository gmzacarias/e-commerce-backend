import { UserRepository } from "repositories/userRepository"
import { User } from "models/user"

describe("test in method getCart", () => {
    it("should update the user with the data received as parameters", async () => {
        const userData = [{
            id: "userId001",
            data: {
                userName: "userTest",
                email: "userTest@email.com",
                phoneNumber: "1234567890",
                cart: [],
                address: {}
            }
        }];
        const repo = new UserRepository() as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockResolvedValue(true);
        const updateMock = jest.fn().mockResolvedValue(true);
        repo.userCollection = {
            doc: jest.fn().mockReturnValue({
                update: updateMock
            })
        };
        const data = new User(userData[0].id, userData[0].data as any);
        const result = await repo.save(data);
        expect(getUserDocSpy).toHaveBeenCalledWith("userId001");
        expect(updateMock).toHaveBeenCalledWith(data.data);
        expect(result).toBe(true);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este id");
        const userData = [{
            id: "userId001",
            data: {
                userName: "userTest",
                email: "userTest@email.com",
                phoneNumber: "1234567890",
                cart: [],
                address: {}
            }
        }];
        const repo = new UserRepository as any;
        const getUserDocSpy = jest.spyOn(repo, "getUserDoc").mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.save(userData[0])).rejects.toThrow(error);
        expect(getUserDocSpy).toHaveBeenCalledWith(userData[0].id);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo actualizar el documento:", error.message);
        consoleSpy.mockRestore();
    })
})