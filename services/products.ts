import { authAirtable, processAirtableProducts } from "./airtable"

export async function getProducts(): Promise<AlgoliaData[]> {
    try {
        const response = await authAirtable()
        const productsData = await processAirtableProducts(response)
        return productsData.validRecords
    } catch (error) {
        console.error("error al obtener los productos:", error.message)
        throw error
    }
}