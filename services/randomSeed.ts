import gen from "random-seed"

export function generateRandomCode(): number {
    try {
        const seed = new Date().toISOString();
        let random = gen.create(seed)
        const code = random.intBetween(10000, 99999)
        return code
    } catch (error) {
        console.error("no se pudo generar el codigo random:", error.message)
        throw error
    }
}