import { hasProducts } from "./hasProducts"

export function hasStock(data: ProductData[]): ProductData[] {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const outOfStock = []
        for (const i of data) {
            const resta = i.stock - i.quantity
            i.stock = resta
            if (resta < 0) {
                outOfStock.push(i.objectID)
            }
        }
        if (outOfStock.length > 0) {
            throw new Error(`productos sin stock:${outOfStock.join(", ")}`)
        }
        return data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}