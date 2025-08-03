import { getOffsetAndLimit } from "utils/pagination"

describe("test in function getOffsetAndLimit", () => {
    it("should return the offset and limit values", () => {
        const newOffset = "2";
        const newLimit = "10";
        const result = getOffsetAndLimit(newOffset,newLimit);
        expect(result).toEqual({
            limit: 10,
            offset: 2
        })
    })

    it("should return offset 0 and limit 10 if the offset and limit parameters are undefined", () => {
        const result = getOffsetAndLimit(undefined, undefined);
        expect(result).toEqual({
            limit: 10,
            offset: 0
        })
    })
})