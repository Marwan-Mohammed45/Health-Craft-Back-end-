import jwt from "jsonwebtoken";
import Patient from "../models/Patient.model.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export const protectPatient = async (req, res, next) => {
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
        message: "Not authorized: Token is missing.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
        message:
          err.name === "TokenExpiredError"
            ? "Token has expired."
            : "Invalid token.",
      });
    }

    const patient = await Patient.findById(decoded.id).select("-password").lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        code: "PATIENT_NOT_FOUND",
        message: "Patient account not found.",
      });
    }

    req.patient = patient;
    next();
  } catch (error) {
    console.error("Patient Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Internal server error. Please try again later.",
    });
  }
};
