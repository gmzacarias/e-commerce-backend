export function formatDate(date: FirestoreTimestamp): Date {
    try {
        const { _nanoseconds, _seconds } = date
        if (typeof _seconds !== "number" || typeof _nanoseconds !== "number") {
            throw new Error("Los datos no son del type number");
        }
        const newDate = new Date(_seconds * 1000 + Math.floor(_nanoseconds / 1000000))
        return newDate
    } catch (error) {
        console.error("no se pudo formatear la fecha :", error.message)
        throw error
    }
}