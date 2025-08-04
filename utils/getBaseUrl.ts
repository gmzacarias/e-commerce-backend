export function getBaseUrl(): UrlData {
    try {
        const isDev = process.env.NODE_ENV === "development"
        const baseUrl = process.env.HOOKDECK_URL
        const productionUrl = process.env.VERCEL_URL
        if (!baseUrl) throw new Error("baseUrl no esta definida")
        if (!productionUrl) throw new Error("productionUrl no esta definida")
        const notificationUrl = isDev ? baseUrl : productionUrl
        const successUrl = baseUrl
        const pendingUrl = baseUrl
        const failureUrl = baseUrl
        return { notificationUrl, successUrl, pendingUrl, failureUrl }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}