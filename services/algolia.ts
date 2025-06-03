import { SearchIndex } from "algoliasearch";
import { productIndex, productsAscIndex, productsDescIndex } from "lib/algolia"
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
import { authAirtable } from "services/airtable"
import { uploadCloudinary } from "services/cloudinary"
import { getOffsetAndLimit } from "utils/pagination";

async function mapAirtableToAlgolia(records: AlgoliaData[]) {
    return Promise.all(
        records.map(async (record) => {
            if (!record.photo) {
                throw new Error(`Error al procesar el producto con ID ${record.id}`);
            }
            const photoUrl = await uploadCloudinary(record.photo);
            return {
                ...record,
                objectID: record.id,
                photo: photoUrl.secure_url,
                quantity: 0,
                totalPrice: record.price
            }
        })
    )
}

export async function getProducts() {
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
        const waitTasks = syncAlgolia.taskIDs.map(taskId => productIndex.waitTask(taskId))
        const checkTasks = await Promise.all(waitTasks)
        return checkTasks
    } catch (error) {
        console.error(`hubo un problema con la sincronizacion en Algolia : ${error.message}`)
        throw error;
    }
}

export async function searchProductById(productId: string): Promise<ProductData> {
    try {
        const products = await getProducts()
        const filterProduct = products.find(item => item.id === productId)
        return filterProduct
    } catch (error) {
        console.error("Error al encontrar el producto:", error.message)
        throw error
    }
}


function checkIndexAlgolia(sort: string) {
    const sortToIndexMap: Record<string, SearchIndex> = {
        "price_asc": productsAscIndex,
        "price_desc": productsDescIndex
    }
    const currentIndex = sort ? sortToIndexMap[sort] : productIndex
    return currentIndex
}

export async function searchProductsByQuery(req: NextApiRequest) {
    const { offset, limit } = getOffsetAndLimit(req)
    const q = req.query.q as string
    const sort = req.query.sort as string
    try {
        const currentIndex = checkIndexAlgolia(sort)
        const results = await currentIndex.search<AlgoliaData>(q, {
            hitsPerPage: limit,
            page: offset > 1 ? Math.floor(offset / limit) : 0,
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

export async function GetFeaturedProducts(): Promise<AlgoliaData[]> {
    try {
        const results = await productIndex.search<AlgoliaData>("")
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
