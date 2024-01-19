import type { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "lib/middleware"
import { getOrderById } from "controllers/user"

async function handler(req: NextApiRequest, res: NextApiResponse, token) {
    const user = getOrderById(token.userId)
    res.send(user)
}

export default authMiddleware(handler)