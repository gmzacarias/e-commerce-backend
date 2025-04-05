import { NextApiRequest } from "next"

export function getOffsetAndLimit(req: NextApiRequest, maxLimit = 100, maxOffset = 10000) {
    const queryLimit = parseInt(req.query.limit as string ?? "10", 10)
    const queryOffset = parseInt(req.query.offset as string ?? "0", 10)
    const limit = Math.min(Math.max(queryLimit, 1), maxLimit)
    const offset = Math.min(queryOffset, queryLimit)
    return { limit, offset }
}
