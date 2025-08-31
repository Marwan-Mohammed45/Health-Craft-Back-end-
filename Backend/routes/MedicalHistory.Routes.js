import express from "express";
import medicalController from "../controller/medicalHistory.controller.js";
import { protectPatient } from "../middleware/patient.Auth.middelware.js";
import upload from "../middleware/uploads.js"; // لو حبيت تدعم رفع الملفات

const router = express.Router();

router.post("/", protectPatient, upload.array("files"), medicalController.addRecord);
router.put("/:id", protectPatient, medicalController.updateRecord);
router.get("/", protectPatient, medicalController.getHistory);

export default router;
