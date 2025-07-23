import { expect, describe } from '@jest/globals'
import { isAfter } from 'date-fns'
import { checkExpiration } from "services/dateFns"
import { formatDate } from 'utils/formatDate'

jest.mock("date-fns", () => ({
    isAfter: jest.fn(),
}))

jest.mock("utils/formatDate", () => ({
    formatDate: jest.fn(),
}))

afterEach(() => {
    jest.useRealTimers();
})

describe("test in function checkExpiration", () => {
    it("should check the expiration date and return a boolean", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const date = new Date("2025-07-18T22:00:00Z");
        const currentDate = new Date("2025-07-20T22:00:00Z");
        (isAfter as jest.Mock).mockImplementation(() => true);
        const result = checkExpiration(date);
        expect(date instanceof Date).toBe(true);
        expect(isAfter).toHaveBeenCalledWith(currentDate, date);
        expect(result).toBe(true);
    })

    it("should check the date instance and if it is not Date format it and return a boolean", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const date = {
            _nanoseconds: 0,
            _seconds: 1758184800
        };
        const newDate = new Date("2025-07-18T22:00:00Z");
        const currentDate = new Date("2025-07-20T22:00:00Z");
        (formatDate as jest.Mock).mockReturnValue(newDate);
        (isAfter as jest.Mock).mockImplementation(() => true);
        const result = checkExpiration(date);
        expect(date instanceof Date).toBe(false);
        expect(formatDate).toHaveBeenCalledWith(date);
        expect(isAfter).toHaveBeenCalledWith(currentDate, newDate);
        expect(result).toBe(true);
    })

    it("should throw an error if the expiration date cannot be checked", () => {
        const error = new Error("Hubo un error al comparar la fecha de expiracion");
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const date = {
            _nanoseconds: 0,
            _seconds: 1758184800
        };
        const newDate = new Date("2025-07-18T22:00:00Z");
        const currentDate = new Date("2025-07-20T22:00:00Z");
        (formatDate as jest.Mock).mockReturnValue(newDate);
        (isAfter as jest.Mock).mockImplementation(() => {
            throw error;
        });
        expect(()=>checkExpiration(date)).toThrow(error);
        expect(date instanceof Date).toBe(false);
        expect(formatDate).toHaveBeenCalledWith(date);
        expect(isAfter).toHaveBeenCalledWith(currentDate, newDate);
    })

})