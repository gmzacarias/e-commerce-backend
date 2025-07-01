import { describe, expect } from "@jest/globals"
import { AuthService } from "./auth"

describe("test in AuthService", () => {
    let authService: AuthService
    let mockAuthRepo: any
    let mockUserRepo: any






})

// import { AuthService } from "services/authService"
// import { AuthRepository } from "repositories/authRepository"
// import { UserRepository } from "repositories/userRepository"
// import { sendCodeAuth } from "services/sendgrid"
// import { generateToken } from "services/jwt"
// import { Auth } from "models/auth"

// // Mocks
// jest.mock("services/sendgrid", () => ({
//   sendCodeAuth: jest.fn(),
// }))
// jest.mock("services/jwt", () => ({
//   generateToken: jest.fn().mockReturnValue("mock-token"),
// }))


// let mockAuthRepo: jest.Mocked<AuthRepository>
// let mockUserRepo: jest.Mocked<UserRepository>
// let authService: AuthService

// beforeEach(() => {
//   mockAuthRepo = {
//     findByEmail: jest.fn(),
//     createAuth: jest.fn(),
//     findByCode: jest.fn(),
//     save: jest.fn()
//   } as any

//   mockUserRepo = {
//     createUser: jest.fn()
//   } as any

//   authService = new AuthService(mockAuthRepo, mockUserRepo)
// })

// describe("AuthService.newAuth", () => {
//   it("debería crear un nuevo usuario y auth si no existe", async () => {
//     mockAuthRepo.findByEmail.mockResolvedValue(null)
//     mockUserRepo.createUser.mockResolvedValue({ id: "user123" })
//     mockAuthRepo.createAuth.mockResolvedValue({ data: { email: "test@test.com", userId: "user123" } })

//     const result = await authService.newAuth("Test@Test.com")

//     expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("test@test.com")
//     expect(mockUserRepo.createUser).toHaveBeenCalled()
//     expect(mockAuthRepo.createAuth).toHaveBeenCalled()
//     expect(result.data.userId).toBe("user123")
//   })

//   it("debería retornar auth existente si ya existe", async () => {
//     const existingAuth = { data: { email: "test@test.com", userId: "user123" } }
//     mockAuthRepo.findByEmail.mockResolvedValue(existingAuth)

//     const result = await authService.newAuth("Test@Test.com")

//     expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("test@test.com")
//     expect(result).toBe(existingAuth)
//   })
// })

// describe("AuthService.sendCode", () => {
//   it("debería enviar el código existente si no expiró", async () => {
//     const auth = {
//       data: { code: 123456, expire: new Date(Date.now() + 10000) },
//     }
//     mockAuthRepo.findByEmail.mockResolvedValue(auth)
//     jest.spyOn(authService, "newAuth").mockResolvedValue(auth as any)

//     const result = await authService.sendCode("test@test.com")

//     expect(sendCodeAuth).toHaveBeenCalledWith("test@test.com", 123456)
//     expect(result).toBe(true)
//   })

//   it("debería generar un nuevo código si expiró", async () => {
//     const auth = {
//       data: { code: 123456, expire: new Date(Date.now() - 10000) },
//       updateCode: jest.fn(),
//       updateExpire: jest.fn()
//     }
//     mockAuthRepo.findByEmail.mockResolvedValue(auth)
//     jest.spyOn(authService, "newAuth").mockResolvedValue(auth as any)

//     const result = await authService.sendCode("test@test.com")

//     expect(auth.updateCode).toHaveBeenCalled()
//     expect(auth.updateExpire).toHaveBeenCalled()
//     expect(mockAuthRepo.save).toHaveBeenCalledWith(auth)
//     expect(sendCodeAuth).toHaveBeenCalled()
//     expect(result).toBe(true)
//   })
// })
