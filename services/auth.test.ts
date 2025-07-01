import { describe, expect } from "@jest/globals"
import { AuthService } from "./auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"
import { generateRandomCode } from "./randomSeed"
import { createExpireDate, checkExpiration } from "./dateFns"
import { generateToken } from "./jwt"
import { sendCodeAuth } from "./sendgrid"

jest.mock("services/sendgrid", () => ({
    sendCodeAuth: jest.fn().mockReturnValue("mock-code")
}))

jest.mock("services/jwt", () => ({
    generateToken: jest.fn().mockReturnValue("mock-token")
}))

jest.mock("services/randomSeed", () => ({
    generateRandomCode: jest.fn().mockReturnValue("mock-random-code")
}))

jest.mock("services/dateFns", () => ({
    createExpireDate: jest.fn().mockReturnValue("mock-expire-date"),
    checkExpiration: jest.fn().mockReturnValue("mock-expiration-value")
}))

describe("test in AuthService", () => {
    let authService: AuthService
    let mockAuthRepo: jest.Mocked<Partial<AuthRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockAuthRepo = {
            findByEmail: jest.fn(),
            createAuth: jest.fn(),
            findByCode: jest.fn(),
            save: jest.fn()
        }

        mockUserRepo = {
            createUser: jest.fn()
        }

        authService = new AuthService(mockAuthRepo, mockUserRepo)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should create new user and auth if no existing", async () => {
        const email = "test@email.com";
        const mockUser = {
            id: "user123",
            email: email,
            userName: "",
            phoneNumber: "",
            address: {
                street: "",
                locality: "",
                city: "",
                state: "",
                postalCode: 0,
                country: "",
            },
            cart: []
        }

        const mockAuth = {
            data: {
                email: mockUser.email,
                userId: mockUser.id,
                code: generateRandomCode(),
                expire: createExpireDate(30)
            }
        }

        mockAuthRepo.findByEmail.mockResolvedValue(null);
        mockAuthRepo.createAuth.mockResolvedValue(mockAuth as any);
        mockUserRepo.createUser.mockResolvedValue(mockUser as any);
        const result = await authService.newAuth(email);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(mockAuthRepo.createAuth).toHaveBeenCalled();
        expect(mockUserRepo.createUser).toHaveBeenCalled();
        expect(result.data.userId).toBe("user123");
    })

    it("should return an user if already exists", async () => {
        const existingAuth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date().setMinutes(30)
            }
        }

        mockAuthRepo.findByEmail.mockResolvedValue(existingAuth as any);
        const result = await authService.newAuth(existingAuth.data.email);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(existingAuth.data.email);
        expect(result).toBe(existingAuth);
    })


    it("should send the existing code if not expired", async () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'))

        const auth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date('2025-06-29T20:25:00Z')
            },
        }

        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockReturnValue(false);
        (sendCodeAuth as jest.Mock).mockReturnValue(true)
        const result = await authService.sendCode(auth.data.email);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(auth.data.email);
        expect(checkExpiration as jest.Mock).toHaveBeenCalledWith(auth.data.expire)
        expect(sendCodeAuth as jest.Mock).toHaveBeenCalledWith(auth.data.email, auth.data.code)
        expect(result).toBe(true);
    })

    it("should generate a new code if it has already expired", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const auth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date('2025-06-29T20:31:00Z')
            },
            updateCode: jest.fn(),
            updateExpire: jest.fn(),
        }

        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        const newCode = generateRandomCode();
        const newExpireDate = createExpireDate(30);
        (sendCodeAuth as jest.Mock).mockResolvedValue(true)
        const result = await authService.sendCode(auth.data.email);
        expect(auth.updateCode).toHaveBeenCalledWith(newCode);
        expect(auth.updateExpire).toHaveBeenCalledWith(newExpireDate);
        expect(mockAuthRepo.save).toHaveBeenCalled();
        expect(sendCodeAuth as jest.Mock).toHaveBeenCalledWith(auth.data.email, newCode)
        expect(result).toBe(true);
    })

    it("should log in if your email and code match", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const auth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date('2025-06-29T20:29:00Z')
            }
        };

        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        mockAuthRepo.findByCode.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockReturnValue(false);
        (generateToken as jest.Mock).mockReturnValue({ userId: auth.data.userId });
        const result = await authService.authenticate(auth.data.email, auth.data.code);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(auth.data.email);
        expect(mockAuthRepo.findByCode).toHaveBeenCalledWith(auth.data.code);
        expect(checkExpiration as jest.Mock).toHaveBeenCalledWith(auth.data.expire)
        expect(generateToken as jest.Mock).toHaveBeenCalledWith({ userId: auth.data.userId })
        expect(result).toEqual({ userId: "user123" })
    })

    it("should throw an error if could not create user", async () => {
        const error = new Error("Error al crear el usuario en la db");
        mockAuthRepo.findByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockRejectedValue(error);
        await expect(authService.newAuth("test@email.com")).rejects.toThrow(error);
    })

    it("should throw an error if could not create auth", async () => {
        const error = new Error("Error al crear el auth en la db")
        const mockUser = {
            id: "user123",
            email: "test@email.com",
            userName: "",
            phoneNumber: "",
            address: {
                street: "",
                locality: "",
                city: "",
                state: "",
                postalCode: 0,
                country: "",
            },
            cart: []
        }
        mockAuthRepo.findByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.createAuth.mockRejectedValue(error);
        await expect(authService.newAuth("test@email.com")).rejects.toThrow(error);
    })

    it("should throw an error if the email could not be sent", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const error = new Error("Error al enviar");
        const auth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date('2025-06-29T20:29:00Z')
            },
            updateCode: jest.fn(),
            updateExpire: jest.fn()
        };

        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockResolvedValue(false);
        (sendCodeAuth as jest.Mock).mockRejectedValue(error);
        await expect(authService.sendCode(auth.data.email)).rejects.toThrow(error)
    })

    it("should throw an error if email no matching", async () => {
        const error = new Error("El email no coincide con los registros de la db");
        mockAuthRepo.findByEmail.mockRejectedValue(error);
        await expect(authService.authenticate("wrongMail@email.com", 123456)).rejects.toThrow(error)
    })

    it("should throw an error if code no matching", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const error = new Error("el code ingresado no coincide con los registros de la db");
        const auth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date('2025-06-29T20:29:00Z')
            }
        };

        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        mockAuthRepo.findByCode.mockRejectedValue(error);
        await expect(authService.authenticate(auth.data.email, 99999)).rejects.toThrow(error);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(auth.data.email)
    })

})
