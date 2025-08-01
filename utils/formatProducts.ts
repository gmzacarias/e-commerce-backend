import { hasProducts } from "./hasProducts"

export function formatProducts(data: ProductData[]): ProductsOrder[] {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const products = data.map(item => {
            return {
                productId: item.objectID,
                brand: item.brand,
                familyModel:item.familyModel,
                model: item.model,
                colour: item.colour,
                photo: item.photo,
                quantity: item.quantity,
                price:item.price
            }
        })
        return products
    } catch (error) {
        console.error(error.message)
        throw error
    }
}