import { describe, expect } from "@jest/globals"
import { AuthService } from "services/auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"
import { generateRandomCode } from "services/randomSeed"
import { createExpireDate, checkExpiration } from "services/dateFns"
import { sendCodeAuth } from "services/sendgrid"
import { cleanEmail } from "utils/cleanEmail"

jest.mock("services/sendgrid", () => ({
    sendCodeAuth: jest.fn().mockReturnValue("mock-code")
}))

jest.mock("services/randomSeed", () => ({
    generateRandomCode: jest.fn().mockReturnValue("mock-random-code")
}))

jest.mock("services/dateFns", () => ({
    createExpireDate: jest.fn().mockReturnValue("mock-expire-date"),
    checkExpiration: jest.fn().mockReturnValue("mock-expiration-value")
}))

jest.mock("utils/cleanEmail", () => ({
    cleanEmail: jest.fn().mockReturnValue("mock-email")
}))

describe("test in method sendCode", () => {
    let authService: AuthService
    let mockAuthRepo: jest.Mocked<Partial<AuthRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockAuthRepo = {
            save: jest.fn()
        }

        mockUserRepo = {}

        authService = new AuthService(mockAuthRepo, mockUserRepo)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should send the existing code if not expired", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;

        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: new Date('2025-07-08T20:30:00Z')
            },
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return new Date('2025-07-08T20:30:00Z');
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockReturnValue(false);
        (sendCodeAuth as jest.Mock).mockImplementation(() => { });
        const result = await authService.sendCode(email);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration as jest.Mock).toHaveBeenCalledWith(mockAuth.data.expire);
        expect(sendCodeAuth).toHaveBeenCalledWith(email, mockAuth.data.code);
        expect(result).toBe(true);
    })

    it("should generate and send a new code if the existing one is expired", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const newExpireDate = new Date('2025-07-08T21:00:00Z');
        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: newExpireDate
            },
            updateCode: jest.fn(),
            updateExpire: jest.fn()
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return newExpireDate;
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        (mockAuth.updateCode as jest.Mock).mockImplementation((newCode) => {
            mockAuth.data.code = newCode;
        });
        (mockAuth.updateExpire as jest.Mock).mockImplementation((newExpire) => {
            mockAuth.data.expire = newExpire;
        });
        (mockAuthRepo.save as jest.Mock).mockResolvedValue(true);
        (sendCodeAuth as jest.Mock).mockImplementation(() => { });
        const result = await authService.sendCode(email);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration).toHaveBeenCalledWith(mockAuth.data.expire);
        expect(mockAuth.updateCode).toHaveBeenCalledWith(randomCode);
        expect(mockAuth.updateExpire).toHaveBeenCalledWith(newExpireDate);
        expect(mockAuthRepo.save).toHaveBeenCalledWith(mockAuth);
        expect(sendCodeAuth).toHaveBeenCalledWith(email, randomCode);
        expect(result).toBe(true);
    })

    it("should throw an error when cleanEmail cannot clean the string", async () => {
        const error = new Error("Hubo un error al eliminar los espacios, se recibio un parametro de tipo number");
        const email = "test@email.com";
        (cleanEmail as jest.Mock).mockImplementation(() => {
            throw error;
        });
        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email as any);
    })

    it("should throw an error when generateRandomCode cannot generate code", async () => {
        const error = new Error("Hubo un error al generar el codigo aleatorio");
        const email = "test@email.com";
        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
    })

    it("should throw an error when createExpireDate cannot create an expiration date", async () => {
        const error = new Error("Hubo un error al crear la fecha de expiracion");
        const email = "test@email.com";
        const randomCode = 12345;

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
    })

    it("should throw an error when newAuth does not return any data ", async () => {
        const error = new Error("No hay ordenes relacionadas al userId");
        const email = "test@email.com";
        const randomCode = 12345;

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return new Date('2025-07-08T20:30:00Z');
            }
        });

        jest.spyOn(authService, "newAuth").mockRejectedValue(error);
        await expect(authService.newAuth(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
    })

    it("should throw an error if checkExpiration cannot check if the code has expired", async () => {
        const error = new Error("Hubo un error al formatear las fechas");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));
        const email = "test@email.com";
        const randomCode = 12345;

        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: new Date('2025-07-08T20:30:00Z')
            },
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return new Date('2025-07-08T20:30:00Z');
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration as jest.Mock).toHaveBeenCalledWith(mockAuth.data.expire);
    })

    it("should throw an error when updating code fails", async () => {
        const error = new Error("No se pudo actualizar el nuevo code de auth");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const newExpireDate = new Date('2025-07-08T21:00:00Z');
        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: newExpireDate
            },
            updateCode: jest.fn(),
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return newExpireDate;
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        (mockAuth.updateCode as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration).toHaveBeenCalledWith(mockAuth.data.expire);
        expect(mockAuth.updateCode).toHaveBeenCalledWith(randomCode);
    })

    it("should throw an error when updating expire fails", async () => {
        const error = new Error("No se pudo actualizar la nueva fecha de expiracion del codigo");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const newExpireDate = new Date('2025-07-08T21:00:00Z');
        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: newExpireDate
            },
            updateCode: jest.fn(),
            updateExpire: jest.fn()
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return newExpireDate;
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        (mockAuth.updateCode as jest.Mock).mockImplementation((newCode) => {
            mockAuth.data.code = newCode;
        });
        (mockAuth.updateExpire as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration).toHaveBeenCalledWith(mockAuth.data.expire);
        expect(mockAuth.updateCode).toHaveBeenCalledWith(randomCode);
        expect(mockAuth.updateExpire).toHaveBeenCalledWith(newExpireDate);
    })

    it("should throw an error when saving auth fails", async () => {
        const error = new Error("No se pudo guardar los nuevos datos en auth");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const newExpireDate = new Date('2025-07-08T21:00:00Z');
        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: newExpireDate
            },
            updateCode: jest.fn(),
            updateExpire: jest.fn()
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return newExpireDate;
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        (mockAuth.updateCode as jest.Mock).mockImplementation((newCode) => {
            mockAuth.data.code = newCode;
        });
        (mockAuth.updateExpire as jest.Mock).mockImplementation((newExpire) => {
            mockAuth.data.expire = newExpire;
        });
        (mockAuthRepo.save as jest.Mock).mockRejectedValue(error);

        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration).toHaveBeenCalledWith(mockAuth.data.expire);
        expect(mockAuth.updateCode).toHaveBeenCalledWith(randomCode);
        expect(mockAuth.updateExpire).toHaveBeenCalledWith(newExpireDate);
        expect(mockAuthRepo.save).toHaveBeenCalledWith(mockAuth);
    })

    it("should throw an error when sending the authentication code fails", async () => {
        const error = new Error("No se pudo enviar el codigo para autenticarse");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const newExpireDate = new Date('2025-07-08T21:00:00Z');
        const mockAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: newExpireDate
            },
            updateCode: jest.fn(),
            updateExpire: jest.fn()
        };

        (cleanEmail as jest.Mock).mockImplementation((value) => {
            return value.trim();
        });
        (generateRandomCode as jest.Mock).mockImplementation(() => {
            return randomCode;
        });
        (createExpireDate as jest.Mock).mockImplementation((minutes) => {
            if (minutes) {
                return newExpireDate;
            }
        });

        jest.spyOn(authService, "newAuth").mockImplementation(() => mockAuth as any);
        (checkExpiration as jest.Mock).mockReturnValue(true);
        (mockAuth.updateCode as jest.Mock).mockImplementation((newCode) => {
            mockAuth.data.code = newCode;
        });
        (mockAuth.updateExpire as jest.Mock).mockImplementation((newExpire) => {
            mockAuth.data.expire = newExpire;
        });
        (mockAuthRepo.save as jest.Mock).mockResolvedValue(true);
        (sendCodeAuth as jest.Mock).mockImplementation(() => {
            throw error;
        });
        await expect(authService.sendCode(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith(email);
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(authService.newAuth).toHaveBeenCalledWith(email);
        expect(checkExpiration).toHaveBeenCalledWith(mockAuth.data.expire);
        expect(mockAuth.updateCode).toHaveBeenCalledWith(randomCode);
        expect(mockAuth.updateExpire).toHaveBeenCalledWith(newExpireDate);
        expect(mockAuthRepo.save).toHaveBeenCalledWith(mockAuth);
        expect(sendCodeAuth).toHaveBeenCalledWith(email, randomCode);
    })
})