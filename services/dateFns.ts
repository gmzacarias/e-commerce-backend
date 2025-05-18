import { addHours, addMinutes, format, isAfter } from "date-fns"
import { es } from "date-fns/locale/es"

export function createExpireDate(minutes: number): Date {
    const now = new Date()
    const expireDate = addMinutes(now, minutes)
    return expireDate
}

export function checkExpiration(date: FirestoreTimestamp | Date): Boolean {
    const currentDate = new Date()
    if (date instanceof Date) {
        return isAfter(currentDate, date)
    }
    const { _nanoseconds, _seconds } = date
    const expirationDate = new Date(_seconds * 1000 + Math.floor(_nanoseconds / 1000000))
    return isAfter(currentDate, expirationDate)
}


export function getDate() {
    const currentDate = new Date()
    const formatDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
    return formatDate
}

export function expirePreference(): string {
    try {
        const currentDate = new Date()
        const newDate = addHours(currentDate, 48)
        const formatDate = format(newDate, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        return formatDate
    } catch (error) {
        console.error("No se pudo crear una fecha de expiracion:", error.message)
        throw error
    }
}


