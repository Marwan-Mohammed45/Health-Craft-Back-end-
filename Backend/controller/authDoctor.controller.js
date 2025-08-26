import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctor.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

const secret = process.env.JWT_SECRET;
const tokenLife = process.env.JWT_EXPIRES || "1d";

const signToken = id => jwt.sign({ id }, secret, { expiresIn: tokenLife });

export const doctorSignup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialization, experience, clinicAddress } = req.body;

  if (!name || !email || !password || !specialization)
    return res.status(400).json({ success: false, message: "Missing required fields" });

  if (await Doctor.findOne({ email }))
    return res.status(409).json({ success: false, message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const otp = generateOTP(6);

  const doctor = await Doctor.create({
    name, email, password: hashed, phone, specialization, experience, clinicAddress,
    profileImage: req.file?.path || null,
    otpCode: otp, otpExpire: Date.now() + 10 * 60000
  });

  await sendEmail(email, "Verify Account", `Your OTP: ${otp}`);

  res.status(201).json({ success: true, message: "Doctor created, verify email" });
});

export const doctorVerifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const doctor = await Doctor.findOne({ email, otpCode: otp, otpExpire: { $gt: Date.now() } });

  if (!doctor) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

  doctor.isVerified = true;
  doctor.otpCode = doctor.otpExpire = undefined;
  await doctor.save();

  res.json({ success: true, message: "Email verified" });
});

export const doctorSignin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const doctor = await Doctor.findOne({ email });
  if (!doctor || !(await bcrypt.compare(password, doctor.password)))
    return res.status(401).json({ success: false, message: "Invalid credentials" });

  if (!doctor.isVerified)
    return res.status(403).json({ success: false, message: "Email not verified" });

  res.json({ success: true, token: signToken(doctor._id), user: doctor });
});

export const doctorForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const doctor = await Doctor.findOne({ email });
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

  const otp = generateOTP(6);
  doctor.resetPasswordToken = otp;
  doctor.resetPasswordExpire = Date.now() + 10 * 60000;
  await doctor.save();

  await sendEmail(email, "Password Reset OTP", `OTP: ${otp}`);
  res.json({ success: true, message: "OTP sent" });
});

export const doctorResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(400).json({ success: false, message: "Passwords mismatch" });

  const doctor = await Doctor.findOne({ email, resetPasswordToken: otp, resetPasswordExpire: { $gt: Date.now() } });
  if (!doctor) return res.status(400).json({ success: false, message: "Invalid OTP" });

  doctor.password = await bcrypt.hash(password, 10);
  doctor.resetPasswordToken = doctor.resetPasswordExpire = undefined;
  await doctor.save();

  res.json({ success: true, message: "Password reset" });
});

export const doctorResendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const doctor = await Doctor.findOne({ email });
  if (!doctor || doctor.isVerified)
    return res.status(400).json({ success: false, message: "Doctor not found or already verified" });

  const otp = generateOTP(6);
  doctor.otpCode = otp;
  doctor.otpExpire = Date.now() + 10 * 60000;
  await doctor.save();

  await sendEmail(email, "New OTP", `OTP: ${otp}`);
  res.json({ success: true, message: "OTP resent" });
});
