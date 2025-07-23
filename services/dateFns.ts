import { addHours, addMinutes, format, isAfter, differenceInDays } from "date-fns"
import { formatDate } from "utils/formatDate"

export function createExpireDate(minutes: number): Date {
    try {
        const now = new Date()
        const expireDate = addMinutes(now, minutes)
        return expireDate
    } catch (error) {
        console.error("no se pudo crear la fecha de expiracion:", error.message)
        throw error
    }
}

export function checkExpiration(date: FirestoreTimestamp | Date): Boolean {
    try {
        const currentDate = new Date()
        if (date instanceof Date) {
            return isAfter(currentDate, date)
        }
        const expirationDate = formatDate(date)
        return isAfter(currentDate, expirationDate)
    } catch (error) {
        console.error("no se pudo chequear la fecha de expiracion:", error.message)
        throw error
    }
}

export function checkExpirationPayments(date: FirestoreTimestamp | Date) {
    try {
        const currentDate = new Date()
        if (date instanceof Date) {
            const result = differenceInDays(currentDate, date)
            return result
        }
        const expirationPayment = formatDate(date)
        const result = differenceInDays(currentDate, expirationPayment)
        return result
    } catch (error) {
        console.error("no se pudo chequear la fecha de expiracion de los pagos:", error.message)
        throw error
    }
}

export function formatExpireDateForPreference(): string {
    try {
        const currentDate = new Date()
        const newDate = addHours(currentDate, 48)
        const formatDate = format(newDate, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        return formatDate
    } catch (error) {
        console.error("no se pudo formatear la fecha para la preferencia:", error.message)
        throw error
    }
}


