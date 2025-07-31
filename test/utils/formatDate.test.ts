import { formatDate } from "utils/formatDate"

describe("test in function formatDate", () => {
    it("should convert the date from Timestamp format to Date type", () => {
        const timestamp = {
            _seconds: 1753925340,
            _nanoseconds: 0
        };
        const expected = new Date(1753925340000);
        const result = formatDate(timestamp);
        expect(result.getTime()).toBe(expected.getTime());
    })

    it("should throw an error when timestamp has invalid data", () => {
        const error = new Error("Los datos no son del type number");
        const timestamp = {
            _seconds: null,
            _nanoseconds: null,
        };
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        expect(() => formatDate(timestamp as any)).toThrow(error);
        expect(consoleSpy).toHaveBeenCalledWith("no se pudo formatear la fecha :", error.message);
        consoleSpy.mockRestore();
    })
})