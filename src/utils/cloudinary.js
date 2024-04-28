import { v2 as cloudinary } from "cloudinary";
// fs is file system
import fs from "fs";

cloudinary.config({
  cloud_name:  "dmzkaulgz",
  api_key: "383517768866328",
  api_secret:"MYOjA_O03h7zvUR7P7dxFDNOPqc",
});

const fileUploadOnClodinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
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
