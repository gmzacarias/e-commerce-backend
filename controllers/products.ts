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

export async function cleanResults(results) {
    const data = results.hits.map(product => {
        const { _highlightResult, ...productData } = product
        return productData
    })
    return data
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
        } else {
            const resultsData = await cleanResults(results)
            res.send({
                results: resultsData,
                pagination: {
                    offset,
                    limit,
                    total: results.nbHits
                }
            })
        }
        res.end()
    } catch (error) {
        console.error("Hubo un problema con la busqueda: ", error.message)
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
