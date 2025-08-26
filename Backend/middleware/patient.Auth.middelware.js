import jwt from "jsonwebtoken";
import Patient from "../models/Patient.model.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined in .env");

export const protectPatient = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token is missing." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Token expired." : "Invalid token.",
      });
    }

    const patient = await Patient.findById(decoded.id).select("-password").lean();
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    req.patient = patient;
    next();
  } catch (err) {
    console.error("ProtectPatient Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
