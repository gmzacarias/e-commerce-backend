import { describe, expect } from "@jest/globals"
import { UserService } from "./user"
import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"

describe("test in user service", () => {
    let userService: UserService
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>
    let mockAuthRepo: jest.Mocked<Partial<AuthRepository>>

    beforeEach(() => {
        mockUserRepo = {
            getUser: jest.fn(),
            save: jest.fn(),
        }

        mockAuthRepo = {
            getAuth: jest.fn(),
            save: jest.fn()
        }

        userService = new UserService(mockUserRepo, mockAuthRepo)
    })

    it("should returns user data", async () => {
        const mockUser = { data: { userName: "John", email: "john@email.com", phoneNumber: "123", address: { city: "my city" } } }
        mockUserRepo.getUser.mockResolvedValue(mockUser as any)
        const result = await userService.getUserData("user123")
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123")
        expect(result).toEqual(mockUser.data)
    })

    it("should updates and saves user and auth", async () => {
        const mockUser = {
            data: {
                userName: "oldName",
                email: "oldEmail@email.com",
                phoneNumber: "123",
                address: {
                    city: "oldCity"
                }

            },
            updateUserName: jest.fn(),
            updateEmail: jest.fn(),
            updatePhoneNumber: jest.fn(),
            updateAddress: jest.fn()
        }

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        }
        mockUserRepo.getUser.mockResolvedValue(mockUser as any)
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any)
        mockUserRepo.save.mockResolvedValue(true)
        mockAuthRepo.save.mockResolvedValue(true)

        const updateData = {
            userName: "newName",
            email: "newEmail@email.com",
            phoneNumber: "1234567890",
            address: {
                city: "new city"
            }
        }

        const result = await userService.updateUserData("user123", updateData)
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123")
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123")
        expect(mockUser.updateUserName).toHaveBeenCalledWith(updateData.userName)
        expect(mockUser.updateEmail).toHaveBeenCalledWith(updateData.email)
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(updateData.email)
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(updateData.phoneNumber)
        expect(mockUser.updateAddress).toHaveBeenCalledWith(updateData.address)
        expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser)
        expect(mockAuthRepo.save).toHaveBeenCalledWith(mockAuth)
        expect(result).toEqual(mockUser.data)
    })

    it("should throw an error if getuser data fails", async () => {
        const error = new Error("No existe informacion relacionada al id ingresado")
        mockUserRepo.getUser.mockRejectedValue(error)
        await expect(userService.getUserData("user123")).rejects.toThrow(error)
    })

    it("should throw an error if save fails", async () => {
        const error = new Error("Error al actualizar los datos")
        const mockUser = {
            data: {},
            updateUserName: jest.fn(),
            updateEmail: jest.fn(),
            updatePhoneNumber: jest.fn(),
            updateAddress: jest.fn()
        }

        const mockAuth = {
            data: {},
            updateEmail: jest.fn()
        }

        mockUserRepo.getUser.mockResolvedValue(mockUser as any)
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any)
        mockUserRepo.save.mockRejectedValue(error)
        mockAuthRepo.save.mockRejectedValue(error)
        const updateData = { email: "failEmail@email.com" }
        await expect(userService.updateUserData("user123", updateData)).rejects.toThrow(error)
    })
})