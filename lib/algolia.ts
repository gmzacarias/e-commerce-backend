import "dotenv/config"
import algoliasearch, { SearchClient, SearchIndex } from "algoliasearch"

if (!process.env.APPLICATION_ID || !process.env.ADMIN_API_KEY) {
    throw new Error("faltan credenciales para iniciar el client")
}


const applicationId = process.env.APPLICATION_ID
const adminApiKey = process.env.ADMIN_API_KEY
const client: SearchClient = algoliasearch(`${applicationId}`, `${adminApiKey}`);
const productIndex: SearchIndex = client.initIndex("products");

export { productIndex }