import { productIndex } from "lib/algolia";
import { authAirtable } from "lib/airtable";
import { getOffsetAndLimit } from "controllers/request";

export async function saveProductsAlgolia() {
    try {
        const response = await authAirtable()
        if (!response) {
            throw new Error("no se pudo obtener la base de datos")
        } else {
            const productsData = await response.map((product) => ({
                objectID: product.Id,
                ...product,
                stock: 10
            }))
            // console.log({productsData})
            const products = productsData
            const syncAlgolia = await productIndex.saveObjects(products)
            return syncAlgolia
        }
    } catch (error) {
        console.error("Hubo un problema con la sincronizacion: ", error.message)
        throw error;
    }
}

export async function searchProducts(req, res) {
    try {
        const { offset, limit } = getOffsetAndLimit(req)
        const { q } = req.query
        const results = await productIndex.search(q, {
            hitsPerPage: limit,
            page: offset > 1 ? Math.floor(offset / limit) : 0
        })
        if (results.nbHits === 0) {
            throw new Error("No hay Resultados")
        }
        console.log(results)
        return res.send({
            results: results.hits,
            pagination: {
                offset,
                limit,
                results: results.nbHits
            }
        })
    } catch (error) {
        console.error("Hubo un problema con la busqueda: ", error.message)
    } finally {
        res.end()
    }
}

export async function productos(req, res) {
    const { offset, limit } = getOffsetAndLimit(req)
    const { q } = req.query
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
        return "hola"
    }
}

export async function searchProductById(productId: string,) {
    try {
        const results = await productIndex.getObject(productId)
        console.log(results.objectID)
        return results
    } catch (error) {
        return (error.message)
    }
}
