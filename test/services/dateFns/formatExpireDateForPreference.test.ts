import { expect, describe } from '@jest/globals'
import { format, addHours } from 'date-fns'
import { formatExpireDateForPreference } from "services/dateFns"

jest.mock("date-fns", () => ({
    format: jest.fn(),
    addHours: jest.fn()
}))

afterEach(() => {
    jest.useRealTimers();
})

describe("test in function formatExpireDateForPreference", () => {
    it("should format the expiration date of the preference", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-07-20T22:00:00Z'));
        const currentDate = new Date("2025-07-20T22:00:00Z");
        const newDate = new Date("2025-07-22T22:00:00Z");
        const expireDateForPreference = "2025-07-22T22:00:00.000Z";
        (addHours as jest.Mock).mockImplementation(() => {
            return newDate;
        });
        (format as jest.Mock).mockImplementation(() => {
            return expireDateForPreference;
        })
        const result = formatExpireDateForPreference();
        expect(addHours).toHaveBeenCalledWith(currentDate, 48);
        expect(format).toHaveBeenCalledWith(newDate, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        expect(result).toBe(expireDateForPreference);
    })

    it("should throw an error when the preference expiration date could not be formatted", () => {
        const error = new Error("Hubo un error al formatear la fecha de expiracion de la preferencia");
        const currentDate = new Date("2025-07-20T22:00:00Z");
        (addHours as jest.Mock).mockImplementation(() => {
            throw error;
        });
        expect(() => formatExpireDateForPreference()).toThrow(error);
        expect(addHours).toHaveBeenCalledWith(currentDate, 48);
    })
})