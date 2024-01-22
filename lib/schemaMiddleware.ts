import type { NextApiRequest, NextApiResponse } from "next"
import * as yup from "yup"

let bodyAuthSchema = yup.object({
    email: yup.string().required()
}).strict(true).noUnknown(true)

export async function validateBodyAuth(req: NextApiRequest, res?: NextApiResponse) {
    try {
        await bodyAuthSchema.validate(req.body)
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

let bodyAuthTokenSchema = yup
    .object()
    .shape({
        email: yup.string().required(),
        code: yup.number().required()
    }).strict(true).noUnknown(true)

export async function validateBodyAuthToken(req: NextApiRequest, res?: NextApiResponse) {
    try {
        await bodyAuthTokenSchema.validate(req.body)
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}