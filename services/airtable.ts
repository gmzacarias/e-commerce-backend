import { airTableConfig } from "lib/airtable"

const { baseId, tableName, token } = airTableConfig

export async function authAirtable() {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/listRecords`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
        )
        if (!response.ok) {
            throw new Error("hubo un error al obtener los datos")
        }
        const data = await response.json();
        const dataRecords = data.records.map((record: { fields: AirtableData }) => record.fields);
        if (!dataRecords || dataRecords.length === 0) {
            throw new Error("No hay records disponibles")
        }
        return dataRecords
    } catch (error) {
        console.error("Hubo un Error al obtener los datos", error.message)
        throw error
    }
}
