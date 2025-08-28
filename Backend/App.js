import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "../Backend/DB/connectdb.js";

import patientAuthRoutes from "../Backend/routes/patient.auth.routes.js";
import doctorAuthRoutes from "../Backend/routes/doctor.auth.routes.js";
import medicalHistoryRoutes from "../Backend/routes/MedicalHistory.Routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => {
  res.status(200).send("Backend is running 🚀");
});

app.use("/auth/api/patient", patientAuthRoutes);
app.use("/auth/api/doctor", doctorAuthRoutes);
app.use("/api/medicalHistory", medicalHistoryRoutes);

connectDB();

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
