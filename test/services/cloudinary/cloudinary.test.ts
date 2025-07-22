import { describe, expect } from "@jest/globals";
import { cloudinary } from 'lib/cloudinary';
import type { UploadApiResponse } from "cloudinary";
import { uploadCloudinary } from "services/cloudinary";

jest.mock("lib/cloudinary", () => ({
    cloudinary: {
        uploader: {
            upload: jest.fn()
        }
    }
}))

describe("test in function uploadCloudinary", () => {
    it("should upload an image and return a response from Cloudinary", async () => {
        const image = 'data:image/jpg;base64,xyz';
        const mockResponse = {
            secure_url: "https://cloudinary.com/image.webp",
            public_id: "image_id",
            format: "webp",
        } as UploadApiResponse;
        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockResponse);
        const result = await uploadCloudinary(image);
        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(image, {
            resource_type: "image",
            discard_original_filename: true,
            format: "webp"
        });
        expect(result).toEqual(mockResponse);
    })

    it("should throw error if cloudinary fails", async () => {
        const error = new Error("No se pudo subir la imagen");
        const image = 'data:image/jpg;base64,xyz';
        (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(error);
        await expect(uploadCloudinary(image)).rejects.toThrow(error);
        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(image,{
            resource_type: "image",
            discard_original_filename: true,
            format: "webp" 
        });
    })
})
