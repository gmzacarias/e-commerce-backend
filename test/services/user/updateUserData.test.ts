import { describe } from "@jest/globals"
import { UserService } from "services/user"
import { UserRepository } from "repositories/userRepository"
import { AuthRepository } from "repositories/authRepository"

describe("test in method updateUserData", () => {
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
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        const mockExpectedUser = {
            data: {
                userName: "newName",
                email: "newEmail@email.com",
                phoneNumber: "1234567890",
                address: {
                    city: "new city"
                }
            }
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockUser.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockUser.data.email = newEmail;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockAuth.data.email = newEmail
        });
        (mockUser.updateAddress as jest.Mock).mockImplementation((newcity) => {
            mockUser.data.address.city = newcity;
        });
        mockUserRepo.save.mockResolvedValue(true);
        mockAuthRepo.save.mockResolvedValue(true);

        const result = await userService.updateUserData("user123", mockExpectedUser.data);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockExpectedUser.data.userName);
        expect(mockUser.updateEmail).toHaveBeenCalledWith(mockExpectedUser.data.email);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockExpectedUser.data.email);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockExpectedUser.data.phoneNumber);
        expect(mockUser.updateAddress).toHaveBeenCalledWith(mockExpectedUser.data.address);
        expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
        expect(mockAuthRepo.save).toHaveBeenCalledWith(mockAuth);
        expect(result).toEqual(mockUser.data);
    })

    it("should throw an error if getUser does not return data", async () => {
        const error = new Error("No hay datos relacionados al userId");
        mockUserRepo.getUser.mockRejectedValue(error);
        await expect(userService.updateUserData("user123", {})).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
    })

    it("should throw an error if getAuth does not return data", async () => {
        const error = new Error("No hay datos relacionados al userId");
        const mockUser = {
            data: {
                userName: "oldName",
                email: "oldEmail@email.com",
                phoneNumber: "123",
                address: {
                    city: "oldCity"
                }

            },
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockRejectedValue(error);
        await expect(userService.updateUserData("user123", mockUser.data as any)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
    })

    it("should throw an error when the userName cannot be updated in User", async () => {
        const error = new Error("No se pudo actualizar userName");
        const mockUser = {
            data: {
                userName: "oldName",
                email: "oldEmail@email.com",
                phoneNumber: "123",
                address: {
                    city: "oldCity"
                }

            },
            updateUserName: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
    })

    it("should throw an error when the userName cannot be updated in User", async () => {
        const error = new Error("No se pudo actualizar userName");
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
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
    })

    it("should throw an error when the phoneNumber cannot be updated in User", async () => {
        const error = new Error("No se pudo actualizar phoneNumber");
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
            updatePhoneNumber: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation(() => {
            throw error;
        })
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
    })

    it("should throw an error when the email cannot be updated in Auth", async () => {
        const error = new Error("No se pudo actualizar email");
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
            updatePhoneNumber: jest.fn(),
            updateEmail: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation(() => {
            throw error;
        })
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockAuth.data.email);
    })

    it("should throw an error when the email cannot be updated in User", async () => {
        const error = new Error("No se pudo actualizar email");
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
            updatePhoneNumber: jest.fn(),
            updateEmail: jest.fn(),
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockAuth.data.email = newEmail;
        });
        (mockUser.updateEmail as jest.Mock).mockImplementation(() => {
            throw error;
        });
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockAuth.data.email);
        expect(mockUser.updateEmail).toHaveBeenCalledWith(mockUser.data.email);
    })

    it("should throw an error when the address data cannot be updated in User", async () => {
        const error = new Error("No se pudo actualizar address");
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
            updatePhoneNumber: jest.fn(),
            updateEmail: jest.fn(),
            updateAddress: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockAuth.data.email = newEmail;
        });
        (mockUser.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockUser.data.email = newEmail;
        });
        (mockUser.updateAddress as jest.Mock).mockImplementation(() => {
            throw error;
        })
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockAuth.data.email);
        expect(mockUser.updateEmail).toHaveBeenCalledWith(mockUser.data.email);
        expect(mockUser.updateAddress).toHaveBeenCalledWith(mockUser.data.address);
    })

    it("should throw an error when saving the user fails", async () => {
        const error = new Error("No se pudo guardar los datos en user");
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
            updatePhoneNumber: jest.fn(),
            updateEmail: jest.fn(),
            updateAddress: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockAuth.data.email = newEmail;
        });
        (mockUser.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockUser.data.email = newEmail;
        });
        (mockUser.updateAddress as jest.Mock).mockImplementation((newAddress) => {
            mockUser.data.address = newAddress;
        });
        mockUserRepo.save.mockRejectedValue(error);
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockAuth.data.email);
        expect(mockUser.updateEmail).toHaveBeenCalledWith(mockUser.data.email);
        expect(mockUser.updateAddress).toHaveBeenCalledWith(mockUser.data.address);
        expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    })

    it("should throw an error when the address data cannot be updated in User", async () => {
        const error = new Error("No se pudo actualizar address");
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
            updatePhoneNumber: jest.fn(),
            updateEmail: jest.fn(),
            updateAddress: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockAuth.data.email = newEmail;
        });
        (mockUser.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockUser.data.email = newEmail;
        });
        (mockUser.updateAddress as jest.Mock).mockImplementation(() => {
            throw error;
        })
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockAuth.data.email);
        expect(mockUser.updateEmail).toHaveBeenCalledWith(mockUser.data.email);
        expect(mockUser.updateAddress).toHaveBeenCalledWith(mockUser.data.address);
    })

    it("should throw an error when saving the auth fails", async () => {
        const error = new Error("No se pudo guardar los datos en auth");
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
            updatePhoneNumber: jest.fn(),
            updateEmail: jest.fn(),
            updateAddress: jest.fn()
        };

        const mockAuth = {
            data: {
                email: "oldEmail@email.com",
                userId: "user123",
                code: 12345,
                expire: new Date().setMinutes(30)
            },
            updateEmail: jest.fn()
        };

        mockUserRepo.getUser.mockResolvedValue(mockUser as any);
        mockAuthRepo.getAuth.mockResolvedValue(mockAuth as any);
        (mockUser.updateUserName as jest.Mock).mockImplementation((newUserName) => {
            mockUser.data.userName = newUserName;
        });
        (mockUser.updatePhoneNumber as jest.Mock).mockImplementation((newPhoneNumber) => {
            mockUser.data.phoneNumber = newPhoneNumber;
        });
        (mockAuth.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockAuth.data.email = newEmail;
        });
        (mockUser.updateEmail as jest.Mock).mockImplementation((newEmail) => {
            mockUser.data.email = newEmail;
        });
        (mockUser.updateAddress as jest.Mock).mockImplementation((newAddress) => {
            mockUser.data.address = newAddress;
        });
        mockUserRepo.save.mockResolvedValue(true);
        mockAuthRepo.save.mockRejectedValue(error);
        await expect(userService.updateUserData("user123", mockUser.data)).rejects.toThrow(error);
        expect(mockUserRepo.getUser).toHaveBeenCalledWith("user123");
        expect(mockAuthRepo.getAuth).toHaveBeenCalledWith("user123");
        expect(mockUser.updateUserName).toHaveBeenCalledWith(mockUser.data.userName);
        expect(mockUser.updatePhoneNumber).toHaveBeenCalledWith(mockUser.data.phoneNumber);
        expect(mockAuth.updateEmail).toHaveBeenCalledWith(mockAuth.data.email);
        expect(mockUser.updateEmail).toHaveBeenCalledWith(mockUser.data.email);
        expect(mockUser.updateAddress).toHaveBeenCalledWith(mockUser.data.address);
        expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
        expect(mockAuthRepo.save).toHaveBeenCalledWith(mockAuth);
    })
})