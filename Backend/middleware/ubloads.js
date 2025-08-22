import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// إعداد Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

// دالة عامة لإنشاء Cloudinary storage حسب الفولدر
const createCloudStorage = (folderName) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    },
  });

// إعداد Multer لكل نوع
export const uploadPrescription = multer({
  storage: createCloudStorage("prescriptions"), // يدعم الصور و PDF
});

export const uploadDoctor = multer({
  storage: createCloudStorage("doctors"), // صور فقط
});

export const uploadPatient = multer({
  storage: createCloudStorage("patients"), // صور فقط
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميجا كحد أقصى
});
