// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./DB/connectdb.js"; 
import patientAuthRoutes from "./routes/patient.auth.routes.js";
import doctorAuthRoutes from "./routes/doctor.auth.routes.js";
import medicalHistoryRoutes from "./routes/MedicalHistory.Routes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (_req, res) => {
  res.status(200).send("Backend is running 🚀");
});

app.use("/auth/api/patient", patientAuthRoutes);
app.use("/auth/api/doctor", doctorAuthRoutes);
app.use("/api/medicalHistory", medicalHistoryRoutes);

// Database
connectDB();

// Not Found Route
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err, _req, res, _next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Server Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on http://localhost:${PORT}`);
});
