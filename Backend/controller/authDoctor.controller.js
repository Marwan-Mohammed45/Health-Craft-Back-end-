import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import Doctor from "../models/doctor.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js"; 

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

const createToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

/* -------------------- Multer Upload -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/doctors");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only .jpeg, .jpg, .png formats allowed!"));
  },
});

/* -------------------- Doctor Signup -------------------- */
export const doctorSignup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialization, experience, clinicAddress } = req.body;

  if (!name || !email || !password || !specialization) {
    return res.status(400).json({ success: false, message: "name, email, password, specialization required." });
  }

  const existing = await Doctor.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: "Email already registered." });

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const otp = generateOTP(6);
  const otpExpire = Date.now() + 10 * 60 * 1000;

  const doctor = new Doctor({
    name,
    email,
    password: hashedPassword,
    phone,
    specialization,
    experience,
    clinicAddress,
    profileImage: req.file ? `/uploads/doctors/${req.file.filename}` : null,
    otpCode: otp,
    otpExpire,
    isVerified: false,
  });

  await doctor.save();

  try {
    await sendEmail(email, "Verify your Doctor account", `Your OTP code is: ${otp}. It expires in 10 minutes.`);
  } catch (err) {
    console.error("Error sending email:", err);
  }

  res.status(201).json({ success: true, message: "Doctor registered. Please check your email for OTP." });
});

/* -------------------- Verify Email with OTP -------------------- */
export const doctorVerifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const doctor = await Doctor.findOne({ email, otpCode: otp, otpExpire: { $gt: Date.now() } });
  if (!doctor) return res.status(400).json({ success: false, message: "Invalid or expired OTP." });

  doctor.isVerified = true;
  doctor.otpCode = undefined;
  doctor.otpExpire = undefined;
  await doctor.save();

  res.json({ success: true, message: "Email verified successfully." });
});

/* -------------------- Signin -------------------- */
export const doctorSignin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password required." });

  const doctor = await Doctor.findOne({ email });
  if (!doctor)
    return res.status(401).json({ success: false, message: "Invalid credentials." });

  const isMatch = await bcrypt.compare(password, doctor.password);
  if (!isMatch)
    return res.status(401).json({ success: false, message: "Invalid credentials." });

  if (!doctor.isVerified)
    return res.status(403).json({ success: false, message: "Please verify your email first." });

  const token = createToken({ id: doctor._id, role: "doctor" });

  res.json({
    success: true,
    token,
    user: {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: "doctor",
      specialization: doctor.specialization, // ✅ التخصص هنا
      profileImage: doctor.profileImage,
    },
  });
});

/* -------------------- Forgot Password (OTP) -------------------- */
export const doctorForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required." });

  const doctor = await Doctor.findOne({ email });
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });

  const otp = generateOTP(6);
  doctor.resetPasswordToken = otp;
  doctor.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await doctor.save();

  try {
    await sendEmail(email, "Doctor Password Reset OTP", `Your OTP code is: ${otp}. It expires in 10 minutes.`);
  } catch (err) {
    console.error("Error sending email:", err);
  }

  res.json({ success: true, message: "OTP sent to your email if account exists." });
});

/* -------------------- Reset Password (with OTP) -------------------- */
export const doctorResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email || !otp || !password || !confirmPassword)
    return res.status(400).json({ success: false, message: "All fields are required." });

  if (password !== confirmPassword)
    return res.status(400).json({ success: false, message: "Passwords do not match." });

  const doctor = await Doctor.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!doctor) return res.status(400).json({ success: false, message: "Invalid or expired OTP." });

  doctor.password = await bcrypt.hash(password, SALT_ROUNDS);
  doctor.resetPasswordToken = undefined;
  doctor.resetPasswordExpire = undefined;
  await doctor.save();

  res.json({ success: true, message: "Password reset successfully." });
});

/* -------------------- Resend OTP -------------------- */
export const doctorResendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const doctor = await Doctor.findOne({ email });
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });
  if (doctor.isVerified) return res.status(400).json({ success: false, message: "Doctor already verified." });

  const otp = generateOTP(6);
  doctor.otpCode = otp;
  doctor.otpExpire = Date.now() + 10 * 60 * 1000;
  await doctor.save();

  try {
    await sendEmail(email, "Your New OTP Code", `Your new verification code is: ${otp}`);
  } catch (err) {
    console.error("Error sending email:", err);
  }

  res.json({ success: true, message: "New OTP sent successfully." });
});
