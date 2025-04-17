import { getCartById } from "controllers/user";

export async function getCartTotalPrice(userId: string):Promise<number> {
    try {
        const products = await getCartById(userId);
        const totalPrice = products.reduce((total, product) => {
            return total + (product.price) * product.quantity
        }, 0)
        return totalPrice
    } catch (error) {
        console.error("no se encontraron datos en el carrito ", error.message)
        throw error
    }
}

export async function prepareProductsToCart(userId: string): Promise<ProductsCart[]> {
    try {
        const dataCart = await getCartById(userId)
        const productsIds = dataCart.map(item => {
            return {
                productId: item.objectID,
                brand: item.brand,
                model: item.model,
                colour: item.colour,
                photo: item.photo,
                quantity:item.quantity
            }
        })
        return productsIds
    } catch (error) {
        console.error("error al guardar los datos de los productos", error.message)
        throw error
    }
}

export async function createItemsCart(userId: string): Promise<ItemsData[]> {
    try {
        const dataCart = await getCartById(userId)
        const mapProducts = dataCart.map(product => {
            return {
                id: `${product.id}`,
                title: `${product.brand} ${product.model}`,
                description: `smartphone ${product.brand} ${product.model} `,
                picture_url: product.photo,
                category_id: "Phones",
                quantity: product.quantity,
                currency_id: "ARS",
                unit_price: product.price
            }
        })
        return mapProducts
    } catch (error) {
        console.error("no se encontraron datos en el carrito ", error.message)
        throw error
    }
}