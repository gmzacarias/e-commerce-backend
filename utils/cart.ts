function hasProducts(data: ProductData[]): boolean {
    return data.length > 0
}

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

export function formatProductsForOrder(data: ProductData[]): ProductsOrder[] {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const products = data.map(item => {
            return {
                productId: item.objectID,
                brand: item.brand,
                model: item.model,
                colour: item.colour,
                photo: item.photo,
                quantity: item.quantity
            }
        })
        return products
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function formatItemsForPreference(data: ProductData[]): ItemsData[] {
    try {
        if (!hasProducts(data)) {
            throw new Error("no hay productos")
        }
        const items = data.map(item => {
            return {
                id: `${item.productId}`,
                title: `${item.brand} ${item.model}`,
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