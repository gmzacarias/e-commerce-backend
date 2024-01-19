import type { NextApiRequest, NextApiResponse } from "next"
import { generate } from "lib/jwt"
import { Auth } from "lib/auth"

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const auth = await Auth.findByEmailAndCode(req.body.email, req.body.code)
    // let token=generate({userId:"bO8nVkJYSnoSTt532CHk"})
    // const auth = await sendCode(req.body.email)
    if (!auth) {
        res.status(401).send({ message: "email o code incorrecto" })
    } else {
        const expires = auth.iscodeExpired()
        if (expires) {
            res.status(401).send({
                message: "code expirado"
            })
        }
        const token = generate({ userId: auth.data.userId })
        res.send({token})
    }

}