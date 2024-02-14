import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
export const cors = Cors({
  methods: ["POST", "GET", "HEAD", "PATCH", "DELETE", "PUT"],
  origin: ["http://localhost:3001/api","*"]
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      cors(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        fn(req, res)
        return resolve(result);
      })
    });
  });
}
