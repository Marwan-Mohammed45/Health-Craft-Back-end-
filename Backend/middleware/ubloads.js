import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    },
  });

export const uploadPrescription = multer({ storage: makeStorage("prescriptions") }); // images + pdf
export const uploadDoctor = multer({ storage: makeStorage("doctors") });
export const uploadPatient = multer({
  storage: makeStorage("patients"),
  limits: { fileSize: 5 * 1024 * 1024 },
});
