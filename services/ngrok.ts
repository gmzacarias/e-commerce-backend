export async function getNgrokUrl(): Promise<string> {
    try {
        const res = await fetch("http://127.0.0.1:4040/api/tunnels")
        if (!res.ok) {
            throw new Error("el servidor no esta corriendo")
        }
        const data = await res.json()
        const tunnel = data.tunnels.find((t: { proto: string }) => t.proto === "https")
        return tunnel.public_url || ""
    } catch (error) {
        console.error("error al obtener la url de Ngrok:", error.message)
        throw error
    }
}