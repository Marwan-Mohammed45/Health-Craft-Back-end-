import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },
  profileImage: { type: String, default: "" }, // تخزين رابط أو مسار الصورة
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },              
  otpExpire: { type: Date },             
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
