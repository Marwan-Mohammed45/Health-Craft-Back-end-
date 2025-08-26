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

import patientAuthRoutes from "./routes/patient.auth.routes.js";
import doctorAuthRoutes from "./routes/doctor.auth.routes.js";
import medicalHistoryRoutes from "./routes/MedicalHistory.Routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => res.send("Backend is running 🚀"));

app.use("/auth/api/patient", patientAuthRoutes);
app.use("/auth/api/doctor", doctorAuthRoutes);
app.use("/api/medicalHistory", medicalHistoryRoutes);

connectDB();

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));

export default app;
