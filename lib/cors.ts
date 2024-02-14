import { NextApiRequest, NextApiResponse } from "next";
import Cors from 'cors';

const cors = Cors({
  origin: ['http://localhost:3000', '*'], // Permitir solicitudes desde localhost y cualquier origen en producción,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
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
