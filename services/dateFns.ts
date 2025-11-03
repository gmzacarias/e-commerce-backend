import { addHours, addMinutes, isAfter, differenceInDays, formatISO } from "date-fns"
import { formatTimestamp } from "utils/formatTimeStamp"

export function createExpireDate(minutes: number): Date {
    try {
        const now = new Date(Date.now())
        const expireDate = addMinutes(now, minutes)
        return expireDate
    } catch (error) {
        console.error("no se pudo crear la fecha de expiracion:", error.message)
        throw error
    }
}

export function checkExpiration(date: FirestoreTimestamp | Date, mode: "expiredCode" | "expiredPayment" = "expiredCode"): boolean | number {
    try {
        const formatDate = formatTimestamp(date)
        const currentDate = new Date()
        if (mode === "expiredCode") {
            return isAfter(currentDate, formatDate)
        }
        return differenceInDays(currentDate, formatDate)
    } catch (error) {
        console.error(`No se pudo chequear la fecha de ${mode === "expiredCode" ? "expiracion del codigo" : "expiracion del pago"}:${error.message}`)
        throw error
    }
}

export function formatExpireDateForPreference(): string {
    try {
        const currentDate = new Date()
        const newDate = addHours(currentDate, 48)
        const formatDate = formatISO(newDate, { representation: "complete" })
        return formatDate
    } catch (error) {
        console.error("no se pudo formatear la fecha para la preferencia:", error.message)
        throw error
    }
}


