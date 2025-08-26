import express from "express";
import { uploadPatient } from "../middleware/ubloads.js";
import { protectPatient } from "../middleware/patient.Auth.middelware.js";

import {
  patientSignup,
  patientVerifyEmail,
  patientSignin,
  patientForgotPassword,
  patientResetPassword,
} from "../controller/patientAuth.controller.js";

const router = express.Router();

router.post("/signup", uploadPatient.single("profileImage"), patientSignup);
router.post("/verify-otp", patientVerifyEmail);
router.post("/signin", patientSignin);
router.post("/forgot-password", patientForgotPassword);
router.post("/reset-password", patientResetPassword);
router.get("/profile", protectPatient, (req, res) => {
  res.json({ success: true, patient: req.patient });
});

export default router;
