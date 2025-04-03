import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export function handlerCORS(callback: { (req: NextApiRequest, res: NextApiResponse): void; (req: NextApiRequest, res: NextApiResponse): void; (req: NextApiRequest, res: NextApiResponse): void; (req: NextApiRequest, res: NextApiResponse): void; (req: NextApiRequest, res: NextApiResponse): void; (req: NextApiRequest, res: NextApiResponse): void; (arg0: NextApiRequest, arg1: NextApiResponse): void; }) {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      await NextCors(req, res, {
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        origin: ["*","http://localhost:3000","https://localhost:3000","https://e-commerce-smartshop.vercel.app"],
        optionsSuccessStatus: 200,
      })
      callback(req, res);
    }
}