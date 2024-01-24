import type { NextApiRequest, NextApiResponse } from "next"
import * as yup from "yup"

let bodyAuthSchema = yup.object({
    email: yup.string().required()
}).noUnknown(true)

export async function validateAuth(req: NextApiRequest, res: NextApiResponse) {
    try {
        await bodyAuthSchema.validate(req.body, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

let bodyAuthTokenSchema = yup
    .object()
    .shape({
        email: yup.string().required(),
        code: yup.number().required()
    }).noUnknown(true)

export async function validateAuthToken(req: NextApiRequest, res: NextApiResponse) {
    try {
        await bodyAuthTokenSchema.validate(req.body, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

let queryUserIdSchema = yup.object({
    userId: yup.string().required()
}).noUnknown(true)

export async function validateUserId(req: NextApiRequest, res?: NextApiResponse) {
    try {
        await queryUserIdSchema.validate(req.query, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
}