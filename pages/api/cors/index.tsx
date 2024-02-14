import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "lib/cors";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);
  res.json({
    message: "Este es un endpoint protegido por CORS",
    method: req.method,
    body: req.body,
  });
}