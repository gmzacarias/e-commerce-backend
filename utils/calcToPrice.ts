import { hasProducts } from "./hasProducts"

export function calcTotalPrice(data: ProductData[]): number {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const totalPrice = data.reduce((total, product) => {
            return total + (product.price) * product.quantity
        }, 0)
        return totalPrice
    } catch (error) {
        console.error(error.message)
        throw error
    }
}