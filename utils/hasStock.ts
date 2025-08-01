import { hasProducts } from "./hasProducts"

export function hasStock(data: ProductData[]): ProductData[] {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const outOfStock = []
        for (const i of data) {
            const subtract = i.stock - i.quantity
            i.stock = subtract
            if (subtract < 0) {
                outOfStock.push(i.objectID ?? "producto sin ID")
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