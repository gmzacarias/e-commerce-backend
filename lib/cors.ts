import { NextApiRequest, NextApiResponse } from "next";
import Cors from 'cors';

if (process.env.NODE_ENV == "development") {
  var origin = "http://localhost:3000";

}
 else if (process.env.NODE_ENV == "production") {
  var origin = "*";
}



const cors = Cors({
  origin: origin,
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
      console.log(cors.origin)
      return resolve(result);
    });
  });
}