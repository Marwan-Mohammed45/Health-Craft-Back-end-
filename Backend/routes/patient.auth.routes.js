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

// تسجيل مريض جديد + رفع صورة بروفايل اختياري
router.post("/patient/signup", uploadPatient.single("profileImage"), patientSignup);

router.post("/patient/verify-otp", patientVerifyEmail);

router.post("/patient/signin", patientSignin);

router.post("/patient/forgot-password", patientForgotPassword);

router.post("/patient/reset-password", patientResetPassword);

router.get("/patient/profile", protectPatient, (req, res) => {
  res.json({ success: true, patient: req.patient });
});

export default router;
