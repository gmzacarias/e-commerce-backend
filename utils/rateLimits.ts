import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

type RateLimitData = {
    count: number;
    firstRequest: number;
};

const requests = new Map<string, RateLimitData>();

export function withRateLimit(
    handler: NextApiHandler,
    limit = 5,
    interval = 60_000
): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const ip =
            (req.headers["x-forwarded-for"] as string) ||
            req.socket.remoteAddress ||
            "unknown";
        const now = Date.now();
        if (!requests.has(ip)) {
            requests.set(ip, { count: 0, firstRequest: now });
        }
        const data = requests.get(ip)!;
        if (now - data.firstRequest > interval) {
            data.count = 0;
            data.firstRequest = now;
        }
        data.count += 1;
        requests.set(ip, data);
        if (data.count > limit) {
            return res
                .status(429)
                .json({ message: "Too many requests, please try again later." });
        }
        return handler(req, res);
    };
}