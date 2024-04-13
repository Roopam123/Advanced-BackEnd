import { v2 as cloudinary } from "cloudinary";
// fs is file system
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUploadOnClodinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); // remove file from the loacal server
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove file from the loacal server
    return null;
  }
};

export { fileUploadOnClodinary };
