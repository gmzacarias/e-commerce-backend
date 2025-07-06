import { describe, expect } from "@jest/globals"
import { generateRandomCode } from "../../services/randomSeed"

describe("test in randomSeed", () => {
    it("should return a number of five digits between 10000 and 99999", () => {
        const code = generateRandomCode()
        expect(typeof code).toBe("number")
        expect(code).toBeGreaterThanOrEqual(10000)
        expect(code).toBeLessThanOrEqual(99999)
    })
})
