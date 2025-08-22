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

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});
app.use("/auth/api/patient", patientAuthroutes);
app.use("/auth/api/doctor", doctorAuthroutes);
app.use("/api/medicalHistory", medicalHistory);

connectDB();

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
  });
}

export default app;
