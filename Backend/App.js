import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./DB/connectdb.js";
import patientAuthroutes from "./routes/patient.auth.routes.js";
import doctorAuthroutes from "./routes/doctor.auth.routes.js";
import medicalHistory from "./routes/MedicalHistory.Routes.js";

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/auth/api/patient", patientAuthroutes);
app.use("/auth/api/doctor", doctorAuthroutes);
app.use("/api/medicalHistory", medicalHistory);

connectDB();

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

export default app;
