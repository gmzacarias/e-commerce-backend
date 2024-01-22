import type { NextApiRequest, NextApiResponse } from "next"
import { sendCode } from "controllers/auth"
import method from "micro-method-router"
import { validateBodyAuth } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await validateBodyAuth(req, res)
        const email = req.body.email
        await sendCode(email)
        res.status(200).send({ message: "Codigo Enviado" })
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

const handler = method({
    post: postHandler
})

export default handler
