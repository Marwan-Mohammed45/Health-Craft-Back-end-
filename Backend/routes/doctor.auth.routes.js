import express from "express";
import { protectDoctor } from "../middleware/doctor.middleware.js";
import {
  doctorSignup, doctorVerifyOtp, doctorSignin,
  doctorForgotPassword, doctorResetPassword, doctorResendOtp
} from "../controller/authDoctor.controller.js";

const router = express.Router();

router.post("/signup", doctorSignup);
router.post("/verify-otp", doctorVerifyOtp);
router.post("/signin", doctorSignin);
router.post("/forgot-password", doctorForgotPassword);
router.post("/reset-password", doctorResetPassword);
router.post("/resend-otp", doctorResendOtp);
router.get("/profile", protectDoctor, (req, res) => res.json({ success: true, doctor: req.doctor }));

export default router;
