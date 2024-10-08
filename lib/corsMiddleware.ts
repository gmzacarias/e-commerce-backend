import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export function handlerCORS(callback) {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      // Run the cors middleware
      // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
      await NextCors(req, res, {
        // Options
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        origin: ["*","http://localhost:3000","https://localhost:3000","https://e-commerce-smartshop.vercel.app"],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      });
  
      // Rest of the API logic
      callback(req, res);
      //res.json({ message: "Hello NextJs Cors!" });
    }
}