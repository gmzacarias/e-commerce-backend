import { NextApiRequest, NextApiResponse } from "next";
import Cors from 'cors';

  const cors = Cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS", "HEAD"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  export function runMiddleware(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
      cors(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  }