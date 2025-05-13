import { addHours, format } from "date-fns"

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
