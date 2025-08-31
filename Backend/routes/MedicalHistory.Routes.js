import express from "express";
import medicalController from "../controller/MedicalHistory.Controller.js";
import { protectPatient } from "../middleware/patient.Auth.middelware.js";

const router = express.Router();

router.post("/", protectPatient, medicalController.addRecord);
router.put("/:id", protectPatient, medicalController.updateRecord);
router.get("/", protectPatient, medicalController.getHistory);

export default router;
