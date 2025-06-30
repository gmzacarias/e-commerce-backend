import { describe, expect } from "@jest/globals"
import { cloudinary } from 'lib/cloudinary'
import type { UploadApiResponse } from "cloudinary"
import { uploadCloudinary } from "./cloudinary"

beforeEach(() => {
    jest.clearAllMocks();
})

jest.mock("lib/cloudinary", () => ({
    cloudinary: {
        uploader: {
            upload: jest.fn()
        }
    }
}))

const mockResponse = {
    secure_url: "https://cloudinary.com/image.webp",
    public_id: "image_id",
    format: "webp",
} as UploadApiResponse

describe("test in cloudinary", () => {
    it("should call cloudinary with arguments", async () => {
        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockResponse)
        const image = 'data:image/jpg;base64,xyz'
        await uploadCloudinary(image)
        expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(1)
        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(image, {
            resource_type: "image",
            discard_original_filename: true,
            format: "webp"
        })
    })

    it("should return the cloudinary response", async () => {
        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockResponse)
        const result = await uploadCloudinary('image')
        expect(result).toEqual(mockResponse)
    })

    it("should throw error if cloudinary fails", async () => {
        const error = new Error("upload failed");
        (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(error)
        await expect(uploadCloudinary('image')).rejects.toThrow('upload failed')
    })
})

