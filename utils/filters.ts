export function getFilters(data: Partial<QueryData>, prices: { minPriceValue: number, maxPriceValue: number }): string {
    try {
        if (!data) return ""
        const parsedData: Record<string, any> = {}
        const { minPriceValue, maxPriceValue } = prices
        for (const key in data) {
            const values = data[key]
            if (typeof values === "string" && values.includes(",")) {
                parsedData[key] = values.split(",").map(v => v.trim())
            } else {
                parsedData[key] = values
            }
        }
        let queryFilters: string[] = []
        const stringFilters = ["brand", "familyModel", "system", "colour", "model", "rearCamera", "frontCamera"]
        for (const key of stringFilters) {
            const value = parsedData[key as keyof typeof data]
            if (Array.isArray(value)) {
                const orFilters = value.map((val) => `${key}:"${val}"`).join(" OR ")
                if (orFilters) queryFilters.push(`(${orFilters})`)
            } else if (value) {
                queryFilters.push(`${key}:${value}`)
            }
        }
        if (data.priceMin && data.priceMax) {
            const min = data.priceMin > minPriceValue ? data.priceMin : minPriceValue
            const max = data.priceMax < maxPriceValue ? data.priceMax : maxPriceValue
            queryFilters.push(`price >= ${min} AND price <= ${max} `)
        }
        return queryFilters.join(" AND ")
    } catch (error) {
        console.error(error.message)
        throw error
    }
}





