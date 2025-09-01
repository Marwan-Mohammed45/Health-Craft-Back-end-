import express from "express";
import medicalController from "../controller/MedicalHistory.Controller.js";
import { protectPatient } from "../middleware/patient.Auth.middelware.js";
import { uploadPrescription } from "../middleware/Multer.js";

const router = express.Router();

router.post("/", protectPatient, uploadPrescription.single("prescription"), medicalController.addRecord);
router.put("/:id", protectPatient, uploadPrescription.single("prescription"), medicalController.updateRecord);
router.get("/", protectPatient, medicalController.getHistory);

export default router;
