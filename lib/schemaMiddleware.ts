import type { NextApiRequest, NextApiResponse } from "next"
import * as yup from "yup"

let bodyAuthSchema = yup.object({
    email: yup.string().email().required()
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
        email: yup.string().email().required(),
        code: yup.number()
            .typeError('Debe ser un número')
            .test('check length', 'Debe tener exactamente 5 dígitos', value => value && value.toString().length === 5)
            .required()
    }).noUnknown(true)

export async function validateAuthToken(req: NextApiRequest, res: NextApiResponse) {
    try {
        await bodyAuthTokenSchema.validate(req.body, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

let bodyPatchDataSchema = yup
    .object()
    .shape({
        email: yup.string().email(),
        userName: yup.string(),
        phoneNumber: yup.number(),
        address: yup.string()
    }).noUnknown(true)

export async function validatePatchData(req: NextApiRequest, res: NextApiResponse) {
    try {
        await bodyPatchDataSchema.validate(req.body, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

let queryPatchDataSchema = yup
    .object()
    .shape({
        email: yup.string(),
        userName: yup.string(),
        phoneNumber: yup.number(),
        address: yup.string()
    }).noUnknown(true)

export async function validatePatchSpecifiedData(req: NextApiRequest, res: NextApiResponse) {
    try {
        await queryPatchDataSchema.validate(req.query, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
}

let querySearchProductSchema = yup
    .object()
    .shape({
        q: yup.string(),
        offset: yup.string(),
        limit: yup.string(),
    }).noUnknown(true)

export async function validateSearchProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
        await querySearchProductSchema.validate(req.query, { strict: true })
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
}

let queryProductCartSchema = yup
    .object({
        productId: yup.string(),
    })
    .noUnknown(true)

export async function validateQueryProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
        await queryProductCartSchema.validate(req.query, { strict: true })
        console.log(req.query)
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
}

let bodyProductCartSchema = yup
    .object({
        quantity: yup.number()
            .typeError('Debe ser un número')
            .min(1,"el minimo tiene que ser 1")
            .test('check length', 'Debe tener 2 dígitos como maximo', value => value && value.toString().length <= 2)
            .max(10,"el maximo tiene que ser <= 10")
            .required()
    })
    .noUnknown(true)

export async function validateBodyProduct(req: NextApiRequest, res: NextApiResponse) {
    try {
        await bodyProductCartSchema.validate(req.body, { strict: true })
        console.log(req.body)
    } catch (error) {
       const {path,type,errors}=error
       
        console.log("check",error)
        res.status(403).send({ field: "body", message: {path,type,errors} })
    }
}



let bodyCreateOrderSchema = yup
    .object({
        additionalInfo: yup.string(),
    })
    .noUnknown(true)

export async function validateBodyCreateOrder(req: NextApiRequest, res: NextApiResponse) {
    try {
        await bodyCreateOrderSchema.validate(req.body, { strict: true })
        // console.log(req.body)
    } catch (error) {
        res.status(403).send({ field: "body", message: error })
    }
}

let queryFindOrderSchema = yup
    .object({
        orderId: yup.string(),
    })
    .noUnknown(true)

export async function validateQueryFindOrder(req: NextApiRequest, res: NextApiResponse) {
    try {
        await queryFindOrderSchema.validate(req.query, { strict: true })
        // console.log(req.query)
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
}

let querySearchProductIdSchema = yup
    .object({
        productId: yup.string(),
    })
    .noUnknown(true)

export async function validateQuerySearchProductId(req: NextApiRequest, res: NextApiResponse) {
    try {
        await querySearchProductIdSchema.validate(req.query, { strict: true })
        // console.log(req.query)
    } catch (error) {
        res.status(403).send({ field: "query", message: error })
    }
}
