import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getCartById, getDataById, getOrderById } from "controllers/user"

export function getDate() {
    const currentDate = new Date()
    const formatDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
    return formatDate
}

export async function getProductsIds(userId: string) {
    const dataCart = await getCartById(userId)
    if (dataCart) {
        try {
            const productsIds = dataCart.map(id => {
                return {
                    id: id.objectID
                }
            })
            return productsIds
        } catch (error) {
            console.error("No se encontraron datos en el carrito ", error.message)
        }
    } else {
        return null
    }
}

export async function getProductsCart(userId: string) {
    const dataCart = await getCartById(userId)
    const pictures = dataCart.map((foto) => foto.photo)
    console.log("photo", pictures)
    if (dataCart) {
        try {
            const mapProducts = dataCart.map(product => {
                return {
                    title: product.model,
                    description: `${product.brand} ${product.model}`,
                    picture_url: product.photo,
                    category_id: "Phones",
                    quantity: product.quantity,
                    currency_id: "ARS",
                    unit_price: product.price
                };
            });
            console.log("productos para agregar", mapProducts)

            return mapProducts
        } catch (error) {
            console.error("No se encontraron datos en el carrito ", error.message)
        }
    } else {
        return null
    }
}

export async function getTotalPrice(userId: string) {
    const products = await getCartById(userId);
    if (products) {
        const totalPrice = products.reduce((total, product) => {
            return total + (product.price) * product.quantity;
        }, 0);
        console.log(totalPrice)
        return totalPrice;
    } else {
        return null
    }
}