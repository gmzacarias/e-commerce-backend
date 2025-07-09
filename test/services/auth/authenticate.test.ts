import { describe, expect } from "@jest/globals"
import { AuthService } from "services/auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"
import { generateRandomCode } from "services/randomSeed"
import { createExpireDate, checkExpiration } from "services/dateFns"
import { generateToken } from "services/jwt"
import { sendCodeAuth } from "services/sendgrid"


jest.mock("services/jwt", () => ({
    generateToken: jest.fn().mockReturnValue("mock-token")
}))

jest.mock("services/dateFns", () => ({
    checkExpiration: jest.fn().mockReturnValue("mock-expiration-value")
}))

describe("test in method authenticate", () => {
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