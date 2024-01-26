import { productIndex } from "lib/algolia";
import { authAirtable } from "lib/airtable";
import { getOffsetAndLimit } from "controllers/request";

export async function saveProductsAlgolia() {
    try {
        const response = await authAirtable()
        if (!response) {
            throw new Error("no se pudo obtener la base de datos")
        } else {
            const addStock = await response.map((product) => ({
                ...product,
                stock: 10
            }))
            const products = addStock
            const syncAlgolia = await productIndex.saveObjects(products, {
                autoGenerateObjectIDIfNotExist: true
            })
            return syncAlgolia
        }
    } catch (error) {
        console.error("Hubo un problema con la sincronizacion: ", error.message)
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
        } else {
            const resultsData = results.hits.map(product => {
                const { _highlightResult, ...productData } = product;
                return productData;
            });
            // console.log(resultsData)
            res.send({
                results: resultsData,
                pagination: {
                    offset,
                    limit,
                    total: results.nbHits
                }
            })
        }
    } catch (error) {
        console.error("Hubo un problema con la busqueda: ", error.message)
    }
}

export async function searchProductById(id: string,res) {
    try {
        const results = await productIndex.getObject(id)
        return results
    } catch (error) {
       res.send({message:error.message})
        return null
    }
}