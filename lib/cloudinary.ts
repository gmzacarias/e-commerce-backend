import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUDINARY_CLOUD || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("faltan credenciales de Cloudinary en las variables de entorno")
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export { cloudinary }
