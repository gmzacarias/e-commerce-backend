export function cleanEmail(email: string): string {
    try {
        if (typeof email !== "string") {
            throw new Error(`El type de ${email} no es de type string`)
        }
        return email.trim().toLowerCase()
    } catch (error) {
        console.error("Hubo un error al normalizar el email:", error.message)
        throw error
    }
}