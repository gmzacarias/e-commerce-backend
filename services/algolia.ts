import { SearchIndex } from "algoliasearch";
import { productIndex, productsAscIndex, productsDescIndex } from "lib/algolia"
import { authAirtable } from "services/airtable"
import { uploadCloudinary } from "services/cloudinary"
import { getOffsetAndLimit } from "utils/pagination";

async function mapAirtableToAlgolia(records: AirtableData[]): Promise<AlgoliaData[]> {
    return Promise.all(
        records.map(async (record) => {
            if (!record.photo) {
                throw new Error(`Error al procesar el producto con ID ${record.productId}`);
            }
            const photoUrl = await uploadCloudinary(record.photo);
            return {
                ...record,
                objectID: record.productId,
                photo: photoUrl.secure_url,
                quantity: 0,
                stock: 10,
                totalPrice: record.price
            }
        })
    )
}

export async function getProducts(): Promise<AlgoliaData[]> {
    try {
        const response = await authAirtable()
        const productsData = await mapAirtableToAlgolia(response)
        return productsData
    } catch (error) {
        console.error("error al obtener los productos:", error.message)
        throw error
    }
}

export async function saveProductsAlgolia() {
    try {
        const productsData = await getProducts()
        const syncAlgolia = await productIndex.saveObjects(productsData)

        return await Promise.all(syncAlgolia.taskIDs.map(taskId => productIndex.waitTask(taskId)))

    } catch (error) {
        console.error(`hubo un problema con la sincronizacion en Algolia : ${error.message}`)
        throw error;
    }
}

export async function searchProductById(productId: string): Promise<ProductData> {
    try {
        const products = await getProducts()
        const filterProduct = products.find(item => item.productId === productId)
        return filterProduct
    } catch (error) {
        console.error("Error al encontrar el producto:", error.message)
        throw error
    }
}


function checkIndexAlgolia(sort: string){
    const sortToIndexMap: Record<string, SearchIndex> = {
        "price_asc": productsAscIndex,
        "price_desc": productsDescIndex
    }
    const currentIndex = sort ? sortToIndexMap[sort] : productIndex
    return currentIndex
}

export async function searchProductsByQuery(data: QueryData) {
    const { offset, limit } = getOffsetAndLimit(data.offset, data.limit)
    const q = data.q
    const sort = data.sort
    try {
        const currentIndex = checkIndexAlgolia(sort)
        const results = await currentIndex.search<AlgoliaData>(q, {
            hitsPerPage: limit,
            page: offset > 1 ? Math.floor(offset / limit) : 0,
            attributesToHighlight: []
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
            attributesToHighlight: []
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
        console.error("Error al encontrar el producto:", error.message)
        throw error
    }
}
