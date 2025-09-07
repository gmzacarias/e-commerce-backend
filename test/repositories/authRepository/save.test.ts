import { AuthRepository } from "repositories/authRepository"
import { Auth } from "models/auth"

describe("test in method save", () => {
    it("should update the auth with the data received as parameters", async () => {
        const authData = [{
            id: "user123",
            data: {
                userId: "user123",
                email: "test@example.com",
                code: 123456,
            }
        }
        ];
        const repo = new AuthRepository as any;
        const checkAuthDocSpy = jest.spyOn(repo, "checkAuthDoc").mockResolvedValue(true);
        const updateMock = jest.fn().mockResolvedValue(true);
        repo.authCollection = {
            doc: jest.fn().mockReturnValue({
                update: updateMock
            })
        };
        const data = new Auth(authData[0].id, authData[0].data as any);
        const result = await repo.save(data);
        expect(checkAuthDocSpy).toHaveBeenCalledWith(data.id, data.data.userId);
        expect(updateMock).toHaveBeenCalledWith(data.data);
        expect(result).toBe(true);
    })

    it("should throw an error when the document does not exist", async () => {
        const error = new Error("no existe un documento asociado a este id");
        const authData = [{
            id: "user123",
            data: {
                userId: "user123",
                email: "test@example.com",
                code: 123456,
            }
        }
        ];
        const repo = new AuthRepository as any;
        const checkAuthDocSpy = jest.spyOn(repo, "checkAuthDoc").mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await expect(repo.save(authData[0])).rejects.toThrow(error);
        expect(checkAuthDocSpy).toHaveBeenCalledWith(authData[0].id, authData[0].data.userId);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo actualizar el documento:", error.message);
        consoleSpy.mockRestore();
    })
})