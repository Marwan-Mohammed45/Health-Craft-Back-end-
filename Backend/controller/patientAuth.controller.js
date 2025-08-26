import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

const makeToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// -------------------- Patient Signup --------------------
export const patientSignup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, age, gender, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "name, email, password required." });
  }

  const exists = await Patient.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: "Email already registered." });
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  // OTP للتحقق من الإيميل
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000;

  const patient = new Patient({
    name,
    email,
    password: hashed,
    phone,
    age,
    gender,
    address,
    profileImage: req.file ? req.file.path : null,
    verificationToken: otp,
    verificationTokenExpire: otpExpire,
  });

  await patient.save();

  try {
    await sendEmail(email, "Verify your Patient account", `Your OTP code is: ${otp}. It will expire in 10 minutes.`);
  } catch (err) {
    console.error("Email send error:", err);
  }

  res.status(201).json({ success: true, message: "Patient registered. Please check your email for OTP." });
});

// -------------------- Verify Email with OTP --------------------
export const patientVerifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP required." });
  }

  const patient = await Patient.findOne({
    email,
    verificationToken: otp,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!patient) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  patient.isVerified = true;
  patient.verificationToken = undefined;
  patient.verificationTokenExpire = undefined;
  await patient.save();

  res.json({ success: true, message: "Email verified successfully." });
});

// -------------------- Signin --------------------
export const patientSignin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required." });
  }

  const patient = await Patient.findOne({ email });
  if (!patient) return res.status(401).json({ success: false, message: "Invalid credentials." });

  const ok = await bcrypt.compare(password, patient.password);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials." });

  if (!patient.isVerified) {
    return res.status(403).json({ success: false, message: "Please verify your email first." });
  }

  const token = makeToken({ id: patient._id, role: "patient" });

  res.json({
    success: true,
    token,
    user: {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      role: "patient",
      profileImage: patient.profileImage,
    },
  });
});

// -------------------- Forgot Password (OTP) --------------------
export const patientForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email required." });

  const patient = await Patient.findOne({ email });
  if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  patient.resetPasswordToken = otp;
  patient.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await patient.save();

  try {
    await sendEmail(email, "Patient Password Reset OTP", `Your OTP code is: ${otp}. It will expire in 10 minutes.`);
  } catch (err) {
    console.error("Email send error:", err);
  }

  res.json({ success: true, message: "OTP sent to your email if account exists." });
});

// -------------------- Reset Password (with OTP) --------------------
export const patientResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email || !otp || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  const patient = await Patient.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!patient) return res.status(400).json({ success: false, message: "Invalid or expired OTP." });

  patient.password = await bcrypt.hash(password, SALT_ROUNDS);
  patient.resetPasswordToken = undefined;
  patient.resetPasswordExpire = undefined;
  await patient.save();

  res.json({ success: true, message: "Password reset successfully." });
});
