import { expect, test } from '@jest/globals'
import { formatDateFirebase, createExpireDate, checkExpiration, checkExpirationPayments, formatExpireDateForPreference } from "services/dateFns"
test('should convert a Firebase timestamp to a Date object', () => {
    const input = {
        _seconds: 946655400,
        _nanoseconds: 123000000,
    }
    const result = formatDateFirebase(input);
    expect(result instanceof Date).toBe(true)
    expect(result.toISOString()).toBe('1999-12-31T15:50:00.123Z')
})

test('should add minutes to a date', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-06-29T20:00:00Z'))
    const minutes = 30
    const result = createExpireDate(minutes)
    expect(result instanceof Date).toBe(true)
    expect(result.toISOString()).toBe('2025-06-29T20:30:00.000Z')
    jest.useRealTimers()
})

test("should check the expiration date and return a boolean", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-06-29T22:00:00Z'))
    expect(typeof checkExpiration(new Date())).toBe("boolean")
    jest.useRealTimers()
})

test('should check the expiration payments and return un number', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-06-29T22:00:00Z'))
    expect(typeof checkExpirationPayments(new Date())).toBe("number")
    jest.useRealTimers()
})

test('should convert to Date and format as ISO 8601 string', () => {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/
    const result = formatExpireDateForPreference()
    expect(typeof result).toBe("string")
    expect(iso8601Regex.test(result)).toBe(true)
})