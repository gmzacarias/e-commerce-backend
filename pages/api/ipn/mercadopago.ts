import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
import { updateStatusOrder } from "controllers/order"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    const { topic, id } = req.query as any
    try {
        await updateStatusOrder(topic, id)
        res.send({ message: "Compra exitosa" })
    }
    catch (error) {
        res.status(400).send({ message: error })
    }
}

const handler = method({
    post: postHandler
})

export default handler