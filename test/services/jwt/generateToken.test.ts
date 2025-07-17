import { describe, expect } from "@jest/globals";
import { generateToken } from "services/jwt";

describe("test in function generateToken", () => {
    it("should generate a token", async () => {
        jest.resetModules();
        jest.doMock("lib/jwt", () => ({
            jwt: {
                sign: jest.fn()
            },
            secret: "secret"
        }));

        const { generateToken } = await import("services/jwt");
        const { jwt, secret } = await import("lib/jwt");

        const data = { user: "user001" };
        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIiwiaWF0IjoxNjg4NjQwODAwLCJleHAiOjE2ODg2NDQ0MDB9.w4ef5FaJruYIKvM3I9W6Q6-By6XqAOU7GZlqUZ8F4iY";
        (jwt.sign as jest.Mock).mockImplementation(() => {
            return mockToken;
        });
        const result = generateToken(data);
        expect(jwt.sign).toHaveBeenCalledWith(data, secret);
        expect(result).toEqual(mockToken);
    })

    it("should throw an error if there is no data", () => {
        expect(() => {
            generateToken(undefined as any);
        }).toThrow("faltan parametros para poder generar el token");
    });

    it("should throw an error if there is no secret", async () => {
        jest.resetModules();
        jest.mock("lib/jwt", () => ({
            secret: null
        }));
        const { generateToken } = await import("services/jwt");
        const error = new Error("faltan parametros para poder generar el token");
        const data = { user: "user001" };
        expect(()=>{generateToken(data)}).toThrow(error);
    })
})