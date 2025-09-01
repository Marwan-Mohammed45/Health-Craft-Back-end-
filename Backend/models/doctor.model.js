import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  isVerified: { type: Boolean, default: false },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  clinicAddress: String,
  profileImage: String, 
  otpCode: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
