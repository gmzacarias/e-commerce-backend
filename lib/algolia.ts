import "dotenv/config"
import algoliasearch from "algoliasearch"

const applicationId=process.env.APPLICATION_ID
const adminApiKey = process.env.ADMIN_API_KEY
const client = algoliasearch(`${applicationId}`, `${adminApiKey}`);
export const productIndex = client.initIndex("products");