import { describe, expect } from "@jest/globals"
import { generateRandomCode } from "services/randomSeed"
import gen from "random-seed"

describe("test in randomSeed", () => {
    it("should return a number of five digits between 10000 and 99999", () => {
        const code = generateRandomCode();
        expect(typeof code).toBe("number");
        expect(code).toBeGreaterThanOrEqual(10000);
        expect(code).toBeLessThanOrEqual(99999);
    })

    it("should throw an error when randomSeed.create fails", () => {
        const error = new Error("mock error");
        jest.spyOn(gen, "create").mockImplementation(() => {
            throw error;
        });
        expect(() => generateRandomCode()).toThrow(error);
    })
})

