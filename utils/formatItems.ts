import { hasProducts } from "./hasProducts"

export function formatItems(data: ProductData[]): ItemsData[] {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const items = data.map(item => {
            return {
                id: `${item.productId}`,
                title: `${item.brand} ${item.familyModel} ${item.model}`,
                description: `smartphone ${item.brand} ${item.model} `,
                picture_url: item.photo,
                category_id: "Phones",
                quantity: item.quantity,
                currency_id: "ARS",
                unit_price: item.price
            }
        })
        return items
    } catch (error) {
        console.error(error.message)
        throw error
    }
}