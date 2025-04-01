import "dotenv/config"
import algoliasearch, { SearchClient, SearchIndex } from "algoliasearch"

const applicationId = process.env.APPLICATION_ID
const adminApiKey = process.env.ADMIN_API_KEY

if (!applicationId || !adminApiKey) {
    throw new Error("faltan credenciales para iniciar el client")
}
const client: SearchClient = algoliasearch(`${applicationId}`, `${adminApiKey}`);
const productIndex: SearchIndex = client.initIndex("products");

export { productIndex }