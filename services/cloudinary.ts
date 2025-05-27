import { cloudinary } from "lib/cloudinary"
import type { UploadApiResponse } from "cloudinary"

export async function uploadCloudinary(image: string): Promise<UploadApiResponse> {
    try {
        const response = await cloudinary.uploader.upload(image,
            {
                resource_type: "image",
                discard_original_filename: true,
                format: "webp"
            })
        if (!response) {
            throw new Error("hubo un error al subir las imagenes")
        }
        return response
    } catch (error) {
        console.error("Error en Cloudinary:", error.message)
        throw error
    }
}