import jwt from "jsonwebtoken";
import Doctor from "../models/doctor.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protectDoctor = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "NO_TOKEN",
        message: "Unauthorized: Token is missing.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code:
          err.name === "TokenExpiredError"
            ? "TOKEN_EXPIRED"
            : "INVALID_TOKEN",
        message:
          err.name === "TokenExpiredError"
            ? "Unauthorized: Token has expired."
            : "Unauthorized: Invalid token.",
      });
    }

    const doctor = await Doctor.findById(decoded.id).select(
      "-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        code: "DOCTOR_NOT_FOUND",
        message: "Doctor account not found. Please sign up again.",
      });
    }

    if (!doctor.isVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Access denied: Please verify your email before continuing.",
      });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    console.error("Doctor Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Internal server error. Please try again later.",
    });
  }
};
