import jwt from "jsonwebtoken";
import Patient from "../models/Patient.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const protectPatient = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.patient = await Patient.findById(decoded.id).select("-password");
      if (!req.patient) {
        return res.status(401).json({ success: false, message: "Patient not found" });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};
