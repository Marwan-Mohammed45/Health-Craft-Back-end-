import express from "express";
import { uploadDoctor } from "../middleware/ubloads.js";  
import { protectDoctor } from "../middleware/doctor.middleware.js";

import {
  doctorSignup,
  doctorVerifyOtp,
  doctorSignin,
  doctorForgotPassword,
  doctorResetPassword,
  doctorResendOtp,
} from "../controller/authDoctor.controller.js";

const router = express.Router();

router.post("/doctor/signup", uploadDoctor.single("profileImage"), doctorSignup);

router.post("/doctor/verify-otp", doctorVerifyOtp);

router.post("/doctor/signin", doctorSignin);

router.post("/doctor/forgot-password", doctorForgotPassword);

router.post("/doctor/reset-password", doctorResetPassword);

router.post("/doctor/resend-otp", doctorResendOtp);

router.get("/doctor/profile", protectDoctor, (req, res) => {
  res.json({ success: true, doctor: req.doctor });
});

export default router;
