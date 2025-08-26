import jwt from "jsonwebtoken";
import Doctor from "../models/doctor.model.js";

const secret = process.env.JWT_SECRET;

export const protectDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, secret);
    const doctor = await Doctor.findById(decoded.id).select("-password");

    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doctor.isVerified) return res.status(403).json({ success: false, message: "Email not verified" });

    req.doctor = doctor;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
