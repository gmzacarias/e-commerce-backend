import { SearchIndex } from "algoliasearch"
import { productIndex, productsAscIndex, productsDescIndex } from "lib/algolia"

export function checkIndex(sort: string) {
    const sortToIndexMap: Record<string, SearchIndex> = {
        "price_asc": productsAscIndex,
        "price_desc": productsDescIndex
    }
    const currentIndex = sort ? sortToIndexMap[sort] : productIndex
    return currentIndex
}