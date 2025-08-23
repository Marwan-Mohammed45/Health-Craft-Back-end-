import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./DB/connectdb.js";
import patientAuthroutes from "./routes/patient.auth.routes.js";
import doctorAuthroutes from "./routes/doctor.auth.routes.js";
import cors from "cors";
import medicalHistory from "./routes/MedicalHistory.Routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Ignore favicon.ico requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// API Routes
app.use("/auth/api/patient", patientAuthroutes);
app.use("/auth/api/doctor", doctorAuthroutes);
app.use("/api/medicalHistory", medicalHistory);

// Connect DB
connectDB();

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
