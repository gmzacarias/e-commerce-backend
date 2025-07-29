import { checkIndex } from "./checkIndex"

export async function getPrices(currentIndex: string) {
    try {
        const checkCurrentIndex = checkIndex(currentIndex)
        const results = await checkCurrentIndex.search('', {
            facets: ['price'],
            maxValuesPerFacet: 1
        })
        const prices = results.facets_stats.price
        const minPriceValue = prices.min
        const maxPriceValue = prices.max
        return { minPriceValue, maxPriceValue }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}