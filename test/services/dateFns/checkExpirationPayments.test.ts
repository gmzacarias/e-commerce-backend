import { expect, describe } from '@jest/globals'
import { differenceInDays } from 'date-fns'
import { checkExpirationPayments } from "services/dateFns"
import { formatDate } from 'utils/formatDate'

jest.mock("date-fns", () => ({
    differenceInDays: jest.fn(),
}))

jest.mock("utils/formatDate", () => ({
    formatDate: jest.fn(),
}))

afterEach(() => {
    jest.useRealTimers();
})

describe("test in function checkExpirationPayments", () => {
    it("should check the expiration date of the payments and return the difference in days.", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const date = new Date("2025-07-18T22:00:00Z");
        const currentDate = new Date("2025-07-20T22:00:00Z");
        (differenceInDays as jest.Mock).mockImplementation(() => 2);
        const result = checkExpirationPayments(date);
        expect(date instanceof Date).toBe(true);
        expect(differenceInDays).toHaveBeenCalledWith(currentDate, date);
        expect(result).toBe(2);
    })

    it("should check the date instance and if it is not Date format it and return the difference in days", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const date = {
            _nanoseconds: 0,
            _seconds: 1758184800
        };
        const newDate = new Date("2025-07-18T22:00:00Z");
        const currentDate = new Date("2025-07-20T22:00:00Z");
        (formatDate as jest.Mock).mockReturnValue(newDate);
        (differenceInDays as jest.Mock).mockImplementation(() => 2);
        const result = checkExpirationPayments(date);
        expect(date instanceof Date).toBe(false);
        expect(formatDate).toHaveBeenCalledWith(date);
        expect(differenceInDays).toHaveBeenCalledWith(currentDate, newDate);
        expect(result).toBe(2);
    })

    it("Should generate an error if the payment due date cannot be verified", () => {
        const error = new Error("Hubo un error al comparar la fecha de expiracion de los pagos");
        const date = {
            _nanoseconds: 0,
            _seconds: 1758184800
        };
        (differenceInDays as jest.Mock).mockImplementation(() => {
            throw error;
        });
        expect(() => checkExpirationPayments(date)).toThrow(error);
    })
})