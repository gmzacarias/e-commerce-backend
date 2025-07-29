import { productIndex } from "lib/algolia"
import { getProducts } from "services/products"
import { checkIndex } from "utils/checkIndex";
import { getFilters } from "utils/filters";
import { getPrices } from "utils/getPrices";
import { getOffsetAndLimit } from "utils/pagination";

export async function saveProductsAlgolia(): Promise<boolean> {
    try {
        const productsData = await getProducts()
        const syncAlgolia = await productIndex.saveObjects(productsData)
        await Promise.all(syncAlgolia.taskIDs.map(taskId => productIndex.waitTask(taskId)))
        return true
    } catch (error) {
        console.error(`hubo un problema con la sincronizacion en Algolia : ${error.message}`)
        throw error;
    }
}

export async function searchProductById(productId: string): Promise<ProductData> {
    try {
        const getProductById = await productIndex.getObject(productId)
        return getProductById as ProductData
    } catch (error) {
        console.error("Error al encontrar el producto:", error.message)
        throw error
    }
}

export async function searchProductsByQuery(data: QueryData) {
    const { offset, limit } = getOffsetAndLimit(data.offset, data.limit)
    const q = data.q
    const sort = data.sort
    const getPricesData = await getPrices(data.sort)
    const filters = getFilters(data, getPricesData)
    try {
        const currentIndex = checkIndex(sort)
        const results = await currentIndex.search<AlgoliaData>(q, {
            hitsPerPage: limit,
            page: offset > 1 ? Math.floor(offset / limit) : 0,
            attributesToHighlight: [],
            filters: filters
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
            return {
                results: [],
                pagination: {
                    offset,
                    limit,
                    totalResults: 0
                }
            }
        }
    } catch (error) {
        console.error("Hubo un problema con la busqueda: ", error.message)
        throw error
    }
}

export async function getFeaturedProducts(): Promise<AlgoliaData[]> {
    try {
        const results = await productIndex.search<AlgoliaData>("", {
            attributesToHighlight: [],
        })
        const data = results.hits
        const filterByBrands = data.map((item) => item.brand)
        const uniqueBrands = Array.from(new Set(filterByBrands))
        const featuredProducts = uniqueBrands.map((brand) => {
            const filtermax = data.filter((item) => item.brand === brand)
            return filtermax.reduce((max, item) =>
                item.price > max.price ? item : max)
        })
        return featuredProducts
    } catch (error) {
        console.error("Error al obtener los productos destacados:", error.message)
        throw error
    }
}

export async function updateStockProducts(data: ProductData[]) {
    try {
        const formatData = data.map(item => {
            return {
                objectID: item.objectID,
                stock: item.stock - item.quantity
            }
        })
        const response = await productIndex.partialUpdateObjects(formatData)
        return response
    } catch (error) {
        console.error("error al actualizar el stock:", error.message)
        throw error
    }
}


