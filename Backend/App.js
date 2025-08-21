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

// ✅ Serve uploaded images
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});
app.use("/auth", patientAuthroutes);
app.use("/auth", doctorAuthroutes);
app.use("/medicalHistory", medicalHistory);

connectDB();

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
