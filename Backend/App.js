process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./DB/connectdb.js";

// استدعاء كل الراوترز
import patientAuthRoutes from "./routes/patient.auth.routes.js";
import doctorAuthRoutes from "./routes/doctor.auth.routes.js";
import medicalHistoryRoutes from "./routes/MedicalHistory.Routes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Basic route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// استخدام الراوترز
app.use("/auth/api/patient", patientAuthRoutes);
app.use("/auth/api/doctor", doctorAuthRoutes);
app.use("/api/medicalHistory", medicalHistoryRoutes);

// Connect to DB
connectDB();

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
