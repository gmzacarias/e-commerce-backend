import { airTableConfig } from "lib/airtable"

const { baseId, tableName, token } = airTableConfig

export async function authAirtable(): Promise<AirtableData[]> {
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
            throw new Error("La respuesta de Airtable no fue exitosa")
        }
        const data = await response.json()
        if (!data || !data.records || !Array.isArray(data.records) || data.records.length === 0) {
            throw new Error("No hay records disponibles")
        }
        const dataRecords = data.records.map((record: { fields: AirtableData }) => record.fields)
        return dataRecords
    } catch (error) {
        console.error("Hubo un Error al obtener los datos", error.message)
        throw error
    }
}
