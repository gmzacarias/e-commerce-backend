import { getBaseUrl } from "utils/getBaseUrl"

const originalEnv = process.env;

afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
});

describe("test in function getBaseUrl", () => {
    it("should return the urls if the environment is development mode", () => {
        process.env = {
            ...originalEnv,
            NODE_ENV: "development",
            HOOKDECK_URL: "http://hookdeck.com",
            VERCEL_URL: "https://vercel.com",
        };
        const notificationUrl = process.env.HOOKDECK_URL;
        const successUrl = process.env.HOOKDECK_URL;
        const pendingUrl = process.env.HOOKDECK_URL;
        const failureUrl = process.env.HOOKDECK_URL;

        getBaseUrl();
        expect(process.env.NODE_ENV).toBe("development");
        expect(notificationUrl).toBe("http://hookdeck.com");
        expect(successUrl).toBe("http://hookdeck.com");
        expect(pendingUrl).toBe("http://hookdeck.com");
        expect(failureUrl).toBe("http://hookdeck.com");
    })

    it("should return the urls if the environment is production mode", () => {
        process.env = {
            ...originalEnv,
            NODE_ENV: "production",
            HOOKDECK_URL: "http://hookdeck.com",
            VERCEL_URL: "https://vercel.com",
        };
        const notificationUrl = process.env.VERCEL_URL;
        const successUrl = process.env.HOOKDECK_URL;
        const pendingUrl = process.env.HOOKDECK_URL;
        const failureUrl = process.env.HOOKDECK_URL;

        getBaseUrl();
        expect(process.env.NODE_ENV).toBe("production");
        expect(notificationUrl).toBe("https://vercel.com");
        expect(successUrl).toBe("http://hookdeck.com");
        expect(pendingUrl).toBe("http://hookdeck.com");
        expect(failureUrl).toBe("http://hookdeck.com");
    })

    it("should throw an error when Hookdeck is not defined", () => {
        process.env = {
            ...originalEnv,
            NODE_ENV: "development",
            HOOKDECK_URL: null,
            VERCEL_URL: "https://vercel.com",
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        const error = new Error("baseUrl no esta definida");
        expect(()=>getBaseUrl()).toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })

    it("should throw an error when Vercel is not defined", () => {
        process.env = {
            ...originalEnv,
            NODE_ENV: "development",
            HOOKDECK_URL: "http://hookdeck.com",
            VERCEL_URL: null,
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        const error = new Error("productionUrl no esta definida");
        expect(()=>getBaseUrl()).toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    })
})
