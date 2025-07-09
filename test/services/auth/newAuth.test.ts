import { describe, expect } from "@jest/globals"
import { AuthService } from "services/auth"
import { AuthRepository } from "repositories/authRepository"
import { UserRepository } from "repositories/userRepository"
import { generateRandomCode } from "services/randomSeed"
import { createExpireDate } from "services/dateFns"
import { cleanEmail } from "utils/cleanEmail"

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

jest.mock("utils/cleanEmail", () => ({
    cleanEmail: jest.fn().mockReturnValue("mock-email")
}))

describe("test in method newAuth", () => {
    let authService: AuthService
    let mockAuthRepo: jest.Mocked<Partial<AuthRepository>>
    let mockUserRepo: jest.Mocked<Partial<UserRepository>>

    beforeEach(() => {
        mockAuthRepo = {
            findByEmail: jest.fn(),
            createAuth: jest.fn(),
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
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const mockUser = {
            id: "user001",
            data: {
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
        };

        const mockAuth = {
            data: {
                email: mockUser.data.email,
                userId: mockUser.id,
                code: randomCode,
                expire: new Date('2025-07-08T20:30:00Z')
            }
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
        mockAuthRepo.findByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.createAuth.mockResolvedValue(mockAuth as any);
        const result = await authService.newAuth(email);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(mockUserRepo.createUser).toHaveBeenCalledWith(mockUser.data as any);
        expect(mockAuthRepo.createAuth).toHaveBeenCalledWith(mockAuth.data as any);
        expect(result).toEqual(mockAuth as any);
    })

    it("should return an user if already exists", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;

        const mockExistingAuth = {
            data: {
                email: email,
                userId: "user001",
                code: randomCode,
                expire: new Date('2025-07-08T20:30:00Z')
            }
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
        mockAuthRepo.findByEmail.mockResolvedValue(mockExistingAuth as any);
        const result = await authService.newAuth(email);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(mockExistingAuth as any);
    })

    it("should throw an error when cleanEmail cannot clean the string", async () => {
        const error = new Error("Hubo un error al eliminar los espacios, se recibio un parametro de tipo number");
        const email = "test@email.com";
        (cleanEmail as jest.Mock).mockImplementation(() => {
            throw error;
        });
        await expect(authService.newAuth(email)).rejects.toThrow(error);
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

        await expect(authService.newAuth(email)).rejects.toThrow(error);
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

        await expect(authService.newAuth(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
    })

    it("should throw an error when findByEmail cannot perform a search in Firestore", async () => {
        const error = new Error("No se pudo conectar con la base de datos de Firestore");
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
        mockAuthRepo.findByEmail.mockRejectedValue(error);
        await expect(authService.newAuth(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
    })

    it("should throw an error when createUser cannot create a new user", async () => {
        const error = new Error("Hubo un error al añadir los datos del nuevo usuario a Firestore");
        const email = "test@email.com";
        const randomCode = 12345;
        const mockUser = {
            id: "user001",
            data: {
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
        mockAuthRepo.findByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockRejectedValue(error);
        await expect(authService.newAuth(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(mockUserRepo.createUser).toHaveBeenCalledWith(mockUser.data as any);
    })

    it("should throw an error when createAuth cannot create a new auth", async () => {
        const error = new Error("Hubo un error al añadir los datos del nuevo auth a Firestore");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-08T20:00:00Z'));

        const email = "test@email.com";
        const randomCode = 12345;
        const mockUser = {
            id: "user001",
            data: {
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
        };

        const mockAuth = {
            data: {
                email: mockUser.data.email,
                userId: mockUser.id,
                code: randomCode,
                expire: new Date('2025-07-08T20:30:00Z')
            }
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
        mockAuthRepo.findByEmail.mockResolvedValue(null);
        mockUserRepo.createUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.createAuth.mockRejectedValue(error);
        await expect(authService.newAuth(email)).rejects.toThrow(error);
        expect(cleanEmail).toHaveBeenCalledWith("test@email.com");
        expect(generateRandomCode).toHaveBeenCalled();
        expect(createExpireDate).toHaveBeenCalledWith(30);
        expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(mockUserRepo.createUser).toHaveBeenCalledWith(mockUser.data as any);
        expect(mockAuthRepo.createAuth).toHaveBeenCalledWith(mockAuth.data as any);
    })
})
