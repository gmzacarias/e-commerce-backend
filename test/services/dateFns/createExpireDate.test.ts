import { expect, describe } from "@jest/globals"
import { addMinutes } from "date-fns"
import { createExpireDate } from "services/dateFns"

jest.mock("date-fns", () => ({
    addMinutes: jest.fn(),
}))

afterEach(() => {
    jest.useRealTimers();
})

describe("test in function createExpireDate", () => {
    it("should create an expiration date", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const now = new Date('2025-07-20T22:00:00Z');
        const mockExpireDate = new Date('2025-07-20T22:30:00Z');
        (addMinutes as jest.Mock).mockImplementation(() => {
            return mockExpireDate;
        });
        const result = createExpireDate(30);
        expect(addMinutes).toHaveBeenCalledWith(now, 30);
        expect(result).toEqual(mockExpireDate);
    })

    it("should throw an error when an expiration date cannot be created", () => {
        const error = new Error("Hubo un error al crear la fecha de expiracion");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const now = new Date('2025-07-20T22:00:00Z');
        (addMinutes as jest.Mock).mockImplementation(() => {
            throw error;
        });
        expect(() => createExpireDate(30)).toThrow(error);
        expect(addMinutes).toHaveBeenCalledWith(now, 30);
    })
})