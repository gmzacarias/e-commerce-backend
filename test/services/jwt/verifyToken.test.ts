import { describe, expect } from "@jest/globals";
import { verifyToken } from "services/jwt";

describe("test in function verifyToken", () => {
    it("should verify a token and return a userId within the payload", async () => {
        jest.resetModules();
        jest.doMock("lib/jwt", () => ({
            jwt: {
                verify: jest.fn()
            },
            secret: "secret"
        }));

        const { verifyToken } = await import("services/jwt");
        const { jwt, secret } = await import("lib/jwt");
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIiwiaWF0IjoxNjg4NjQwODAwLCJleHAiOjE2ODg2NDQ0MDB9.w4ef5FaJruYIKvM3I9W6Q6-By6XqAOU7GZlqUZ8F4iY";
        const mockPayload = { user: "user001" };
        (jwt.verify as jest.Mock).mockImplementation(() => {
            return mockPayload;
        });
        const result = verifyToken(token);
        expect(jwt.verify).toHaveBeenCalledWith(token, secret);
        expect(result).toEqual(mockPayload);
    })

    it("should throw an error if there is no data", () => {
        expect(() => {
            verifyToken(undefined as any);
        }).toThrow("faltan parametros para poder verificar el token");
    });

    it("should throw an error if there is no secret", async () => {
        jest.resetModules();
        jest.mock("lib/jwt", () => ({
            secret: null
        }));
        const { verifyToken } = await import("services/jwt");
        const error = new Error("faltan parametros para poder verificar el token");
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIiwiaWF0IjoxNjg4NjQwODAwLCJleHAiOjE2ODg2NDQ0MDB9.w4ef5FaJruYIKvM3I9W6Q6-By6XqAOU7GZlqUZ8F4iY";
        expect(() => { verifyToken(token) }).toThrow(error);
    })
})