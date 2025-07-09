import { describe, expect } from "@jest/globals"
import { UserService } from "services/user"
import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"

describe("test in method getUserData", () => {
    let userService: UserService
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>
    let mockAuthRepo: jest.Mocked<Partial<AuthRepository>>

    beforeEach(() => {
        mockUserRepo = {
            getUser: jest.fn(),
        }

        mockAuthRepo = {}

        userService = new UserService(mockUserRepo, mockAuthRepo)
    })

    it("should returns user data", async () => {
        const mockUser = {
            data: {
                userName: "John",
                email: "john@email.com",
                phoneNumber: "123",
                address: { city: "my city" }
            }
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        const result = await userService.getUserData("user123");
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(result).toEqual(mockUser.data);
    })

    it("should throw an error if getUserData does not return data", async () => {
        const error = new Error("No hay datos relacionados al userId");
        mockUserRepo.getUser.mockRejectedValue(error);
        await expect(userService.getUserData("user123")).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
    })
})