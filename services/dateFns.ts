import { addHours, addMinutes, format, isAfter } from "date-fns"
import { es } from "date-fns/locale/es"

export function getDate():string {
    try {
        const currentDate = new Date()
        const formatDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
        return formatDate
    } catch (error) {
        console.error("no se pudo formatear la fecha:", error.message)
        throw error
    }
}

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
        const { _nanoseconds, _seconds } = date
        const expirationDate = new Date(_seconds * 1000 + Math.floor(_nanoseconds / 1000000))
        return isAfter(currentDate, expirationDate)
    } catch (error) {
        console.error("no se pudo chequear la fecha de expiracion:", error.message)
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


