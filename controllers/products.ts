import { productIndex } from "lib/algolia";
import { authAirtable } from "lib/airtable";
import { uploadCloudinary } from "lib/cloudinary"
import { getOffsetAndLimit } from "utils/request";

export async function saveProductsAlgolia() {
    try {
        const response = await authAirtable()
        if (!response) {
            throw new Error("no se pudo obtener la base de datos")
        } else {
            const productsData = await response.map(async (product) => {
                if (product.photo) {
                    const photoUrl = await uploadCloudinary(product.photo);
                    // console.log(photoUrl.secure_url)
                    return {
                        objectID: product.id,
                        ...product,
                        photo: photoUrl.secure_url,
                        quantity:0,
                        totalPrice:product.price
                    }
                } else {
                    return null
                }
            })
            const productsPromises = await Promise.all(productsData)
            const products = productsPromises
            const syncAlgolia = await productIndex.saveObjects(products)
            return syncAlgolia
        }
    } catch (error) {
        console.error("Hubo un problema con la sincronizacion: ", error.message)
        throw error;
    }
}

export async function searchQueryProducts(req) {
    const { offset, limit } = getOffsetAndLimit(req)
    const { q } = req.query
    try {
        const results = await productIndex.search(q, {
            hitsPerPage: limit,
            page: offset > 1 ? Math.floor(offset / limit) : 0
        })
        if (results.nbHits !== 0) {
            return {
                results: results.hits,
                pagination: {
                    offset,
                    limit,
                    totalResults: results.nbHits
                }
            }
        } else { 
            return{
                results: [],
                pagination: {
                    offset,
                    limit,
                    totalResults:0
                }
            }
        }
    } catch (error) {
        console.error("Hubo un problema con la busqueda: ", error.message)
        throw new Error("No hay Resultados")
    }
}

export async function searchProductById(productId: string,) {
    try {
        const results = await productIndex.getObject(productId)
        // console.log(results.objectID)
        return results
    } catch (error) {
        return (error.message)
    }
}
