import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image and returns its URL, or null if the upload failed.
 * Uses the promise API (not upload_stream), so a failed upload can't become
 * an unhandled promise rejection that crashes the server.
 */
const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
  if (!file) {
    return null;
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, { resource_type: "auto" });
    return result?.secure_url ?? null;
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    return null;
  }
};

export default uploadOnCloudinary;
