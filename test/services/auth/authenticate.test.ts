import { describe, expect } from "@jest/globals"
import { AuthService } from "services/auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"
import { checkExpiration } from "services/dateFns"
import { generateToken } from "services/jwt"
import { cleanEmail } from "utils/cleanEmail"

jest.mock("services/jwt", () => ({
    generateToken: jest.fn().mockReturnValue("mock-token")
}))

jest.mock("services/dateFns", () => ({
    checkExpiration: jest.fn().mockReturnValue("mock-expiration-value")
}))

jest.mock("utils/cleanEmail", () => ({
    cleanEmail: jest.fn().mockReturnValue("mock-email")
}))

describe("test in method authenticate", () => {
    let authService: AuthService
    let mockAuthRepo: jest.Mocked<Partial<AuthRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockAuthRepo = {
            findByEmail: jest.fn(),
            findByCode: jest.fn(),
        }

        mockUserRepo = {}

        authService = new AuthService(mockAuthRepo, mockUserRepo)
    })

    it("should return a token if the email and code match the auth data", async () => {
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

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        mockAuthRepo.findByCode.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockReturnValue(false);
        (generateToken as jest.Mock).mockReturnValue("fakeToken1234");
        const result = await authService.authenticate(auth.data.email, auth.data.code);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(auth.data.email);
        expect(mockAuthRepo.findByCode).toHaveBeenCalledWith(auth.data.code);
        expect(checkExpiration).toHaveBeenCalledWith(auth.data.expire);
        expect(generateToken).toHaveBeenCalledWith({ userId: auth.data.userId });
        expect(result).toEqual("fakeToken1234");
    })

    it("should throw an error when cleanEmail cannot clean the string", async () => {
        const error = new Error("Hubo un error al eliminar los espacios, se recibio un parametro de tipo number");
        const email = "test@email.com";
        const code = 12345;
        (cleanEmail as jest.Mock).mockImplementation(() => {
            throw error;
        });
        await expect(authService.authenticate(email, code)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email as any);
    })

    it("should throw an error if email no matching with auth data", async () => {
        const error = new Error("El email no coincide con los registros de la db");
        const email = "test@email.com";
        const code = 12345;
        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        mockAuthRepo.findByEmail.mockRejectedValue(error);
        await expect(authService.authenticate(email, code)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email as any);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
    })

    it("should throw an error if code no matching with auth data", async () => {
        const error = new Error("El code ingresado no coincide con los registros de la db");
        const email = "test@email.com";
        const code = 12345;
        const auth = {
            data: {
                email: "test@email.com",
            }
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        mockAuthRepo.findByCode.mockRejectedValue(error);
        await expect(authService.authenticate(email, code)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(mockAuthRepo.findByCode).toHaveBeenCalledWith(code);
    })

    it("should throw an error if the code has already expired", async () => {
        const error = new Error("el code ingresado a expirado");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-06-29T20:00:00Z'));

        const auth = {
            data: {
                email: "test@email.com",
                userId: "user123",
                code: 123456,
                expire: new Date('2025-06-29T20:35:00Z')
            }
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        mockAuthRepo.findByCode.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        await expect(authService.authenticate(auth.data.email, auth.data.code)).rejects.toThrow(error);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(auth.data.email);
        expect(mockAuthRepo.findByCode).toHaveBeenCalledWith(auth.data.code);
        expect(checkExpiration).toHaveBeenCalledWith(auth.data.expire);
    })

    it("should throw an error if generatetoken fails to create a new token", async () => {
        const error = new Error("faltan parametros para poder generar el token");
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

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        mockAuthRepo.findByEmail.mockResolvedValue(auth as any);
        mockAuthRepo.findByCode.mockResolvedValue(auth as any);
        (checkExpiration as jest.Mock).mockReturnValue(false);
        (generateToken as jest.Mock).mockImplementation(() => {
            throw error;
        });
        await expect(authService.authenticate(auth.data.email, auth.data.code)).rejects.toThrow(error);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(auth.data.email);
        expect(mockAuthRepo.findByCode).toHaveBeenCalledWith(auth.data.code);
        expect(checkExpiration).toHaveBeenCalledWith(auth.data.expire);
        expect(generateToken).toHaveBeenCalledWith({ userId: auth.data.userId });
    })
})