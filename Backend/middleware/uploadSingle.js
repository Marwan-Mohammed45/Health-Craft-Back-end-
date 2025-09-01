import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../middleware/cloudnairy.js";


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "doctors",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

const upload = multer({ storage: storage });

export default upload;
