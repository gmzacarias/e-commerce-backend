import {describe,expect } from '@jest/globals'
import { authAirtable } from 'services/airtable'

describe("test in function authAirtable", () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should call fetch with the correct headers and return the data", async () => {
        const mockResponse = {
            records: [
                { fields: { id: '1', name: 'Test 1' } },
                { fields: { id: '2', name: 'Test 2' } },
            ],
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        })

        const result = await authAirtable()

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/listRecords'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining('Bearer'),
                }),
            }),
        );
        expect(result).toEqual(mockResponse.records.map(r => r.fields))
    })

    it("should throw an error if response.ok is false", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => { { } }
        })
        await expect(authAirtable()).rejects.toThrow("La respuesta de Airtable no fue exitosa")
    })

    it("should throw an error if there are no records", async () => {
        const mockResponse = { records: [] };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => { { } }
        })
        await expect(authAirtable()).rejects.toThrow("No hay records disponibles")
    })
})