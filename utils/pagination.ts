
export function getOffsetAndLimit(newOffset: string, newLimit: string, maxLimit = 100, maxOffset = 10000) {
    const queryOffset = parseInt(newOffset ?? "0", 10)
    const queryLimit = parseInt(newLimit ?? "10", 10)
    const offset = Math.min(queryOffset, queryLimit)
    const limit = Math.min(Math.max(queryLimit, 1), maxLimit)
    return { limit, offset }
}
