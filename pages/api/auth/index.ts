import type { NextApiRequest, NextApiResponse } from "next"
import method from "micro-method-router"
// import NextCors from "nextjs-cors"
import { sendCode } from "controllers/auth"
import { validateAuth } from "lib/schemaMiddleware"

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // await NextCors(req, res, {
        //     // Options
        //     methods: ['POST'],
        //     origin: '*',
        //     optionsSuccessStatus: 200,
        //  });
        await validateAuth(req, res)
        if (res.statusCode === 403) {
            throw new Error("No se envio el mail")
        }
        const { email } = req.body
        await sendCode(email)
        res.status(200).send({ message: "Codigo Enviado" })
    } catch (error) {
        res.status(400).send({ message: "Error al enviar el codigo", error: error })
    }
}

const handler = method({
    post: postHandler
})

export default handler
