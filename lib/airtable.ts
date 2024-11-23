import "dotenv/config"

const baseId = process.env.AIRTABLE_BASEID
const tableName = process.env.AIRTABLE_TABLENAME
const token = process.env.AIRTABLE_TOKEN

export async function authAirtable() {
    let allRecords = [];
    try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/listRecords`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
        )
        const data = await response.json();
        const dataRecords = data.records.map(record => record.fields);
        if (!dataRecords || dataRecords.length === 0) {
            throw new Error("No hay records disponibles")
        } else {
            allRecords = [...allRecords, ...dataRecords]
        }
        return allRecords
    } catch (error) {
        console.error("Hubo un Error al obtener la data", error.message)
        throw error
    }
}
