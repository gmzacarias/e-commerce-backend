async function getNgrokUrl(): Promise<string> {
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

async function getBaseUrl(orderId: string): Promise<UrlData> {
    try {
        const currentNgrokUrl = await getNgrokUrl()
        const isDev = process.env.NODE_ENV === "development"
        const notificationUrl = isDev ? `${currentNgrokUrl}/api/ipn/mercadopago` : "https://e-commerce-backend-lake.vercel.app/api/ipn/mercadopago"
        const baseFrontEndUrl = isDev ? `${currentNgrokUrl}` : "https://e-commerce-smartshop.vercel.app"
        const successUrl = `${baseFrontEndUrl}/checkoutStatus/${orderId}?status=success`
        const pendingUrl = `${baseFrontEndUrl}/checkoutStatus/${orderId}?status=pending`
        const failureUrl = `${baseFrontEndUrl}/checkoutStatus/${orderId}?status=failure`
        return { notificationUrl, successUrl, pendingUrl, failureUrl }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}