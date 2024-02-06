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

export function cleanResults(results) {
    return results.hits.map(product => {
        const { _highlightResult, ...productData } = product
        return productData
    })
}

export async function getModifyResults(q, limit, offset) {
    const results = await productIndex.search(q, {
        hitsPerPage: limit,
        page: offset > 1 ? Math.floor(offset / limit) : 0
    })
    const resultsData = cleanResults(results)
    return {
        results: resultsData,
        pagination: {
            offset,
            limit,
            total: results.nbHits
        }
    }
}

export async function searchProducts(req, res) {
    try {
        const { offset, limit } = getOffsetAndLimit(req)
        const { q } = req.query
        const results = await getModifyResults(q, limit, offset) as any
        if (results.nbHits === 0) {
            throw new Error("No hay Resultados")
        }
        return res.send(results)

    } catch (error) {
        console.error("Hubo un problema con la busqueda: ", error.message)
    } finally {
        res.end()
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
