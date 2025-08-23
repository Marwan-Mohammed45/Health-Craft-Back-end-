import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./DB/connectdb.js";
import patientAuthroutes from "./routes/patient.auth.routes.js";
import doctorAuthroutes from "./routes/doctor.auth.routes.js";
import cors from "cors";
import medicalHistory from "./routes/MedicalHistory.Routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Root route للتأكد إن السيرفر شغال
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// تجاهل favicon.ico عشان مانشوفش 404
app.get("/favicon.ico", (req, res) => res.status(204).end());

// API Routes
app.use("/auth/api/patient", patientAuthroutes);
app.use("/auth/api/doctor", doctorAuthroutes);
app.use("/api/medicalHistory", medicalHistory);

// Connect to DB
connectDB();

// لو مفيش Route مطابق، رجّع 404 عشان أوضح
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
  });
}

export default app;
