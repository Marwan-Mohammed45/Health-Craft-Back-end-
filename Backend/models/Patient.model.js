import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    phone: String,
    age: Number,
    gender: String,
    address: String,
    profileImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    otpCode: String,
    otpExpire: Date,
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
