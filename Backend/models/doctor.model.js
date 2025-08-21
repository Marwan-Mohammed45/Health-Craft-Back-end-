import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  clinicAddress: { type: String },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  otpCode: { type: String },
  otpExpire: { type: Date },

}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
