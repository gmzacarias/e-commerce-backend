import { format } from "date-fns"
import { es } from "date-fns/locale"
import { sendPaymentConfirmed, sendSaleConfirmed } from "lib/sendgrid"
import { getCartById, getDataById, getOrderById } from "controllers/user"

export function getDate() {
    const currentDate = new Date()
    const formatDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
    return formatDate
}

export async function SaveProductsById(userId: string) {
    const dataCart = await getCartById(userId)
    if (dataCart) {
        try {
            const productsIds = dataCart.map(item => {
                return {
                    productId: item.objectID,
                    brand: item.brand,
                    model: item.model,
                    colour: item.colour,
                    photo: item.photo,
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
    if (dataCart) {
        try {
            const mapProducts = dataCart.map(product => {
                return {
                    id:`${product.id}`,
                    title: `${product.brand} ${product.model}`,
                    description: `smartphone ${product.brand} ${product.model} `,
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


export async function purchaseAlert(email: string, userName: string, order: string) {
    try {
        const data = await sendPaymentConfirmed(email, userName, order)
        return data
    } catch (error) {
        console.error("No se pudo enviar el mail ", error.message)
    }
}

export async function saleAlert(userId: string, order: string, price: number) {
    try {
        const data = await sendSaleConfirmed(userId, order, price)
        return data
    } catch (error) {
        console.error("No se pudo enviar el mail ", error.message)
    }
}