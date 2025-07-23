import { airTableConfig } from "lib/airtable"
import { uploadCloudinary } from "./cloudinary"

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

export async function processAirtableProducts(records: AirtableData[]): Promise<{
    validRecords: AlgoliaData[];
    invalidRecords: string[];
}> {
    try {
        let invalidRecords: string[] = []
        let validRecords: AlgoliaData[] = []
        if (records.length < 1) {
            throw new Error("Los datos obtenidos de Airtable no tienen registros")
        }
        await Promise.all(
            records.map(async (record) => {
                if (!record.photo) {
                    invalidRecords.push(record.productId)
                    return;
                }
                const saveImageUrl = await uploadCloudinary(record.photo)
                validRecords.push({
                    ...record,
                    objectID: record.productId,
                    photo: saveImageUrl.secure_url,
                    quantity: 0,
                    stock: 10,
                    totalPrice: record.price
                })
            })
        )
        return { validRecords, invalidRecords }
    } catch (error) {
        console.error("error al obtener los productos:", error.message)
        throw error
    }
}
