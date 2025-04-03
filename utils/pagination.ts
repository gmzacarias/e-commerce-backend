import { NextRequest } from "next/server"

export function getOffsetAndLimit(req: NextRequest, maxLimit = 100, maxOffset = 10000) {
    const queryLimit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10)
    const queryOffset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0", 10)
    const limit = Math.min(Math.max(queryLimit, 1), maxLimit)
    const offset = Math.min(queryOffset, queryLimit)
    return { limit, offset }
}
