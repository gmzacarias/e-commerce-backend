import "dotenv/config"

if (!process.env.CLOUDINARY_CLOUD || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("faltan credenciales de Airtable en las variables de entorno")
}

const baseId = process.env.AIRTABLE_BASEID
const tableName = process.env.AIRTABLE_TABLENAME
const token = process.env.AIRTABLE_TOKEN
const airTableConfig = {
    baseId: baseId,
    tableName: tableName,
    token: token
}

export { airTableConfig }

