
export function getOffsetAndLimit(newOffset?: string, newLimit?: string, maxLimit = 100, maxOffset = 10000) {
    const rawOffset = parseInt(newOffset ?? "", 10)
    const rawLimit = parseInt(newLimit ?? "", 10)
    const queryOffset = isNaN(rawOffset) ? 0 : rawOffset;
    const queryLimit = isNaN(rawLimit) ? 10 : rawLimit
    const offset = Math.min(Math.max(queryOffset, 0), maxOffset)
    const limit = Math.min(Math.max(queryLimit, 1), maxLimit)
    return { limit, offset }
}
