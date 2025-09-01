import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../middleware/cloudnairy.js";

const doctorStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doctors",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});
export const uploadDoctor = multer({ storage: doctorStorage });

const patientStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "patients",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});
export const uploadPatient = multer({ storage: patientStorage });

const prescriptionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "prescriptions",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    transformation: [{ width: 1000, crop: "limit" }],
  },
});
export const uploadPrescription = multer({ storage: prescriptionStorage });
