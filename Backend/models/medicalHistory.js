import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  description: { type: String },
  prescription: { type: String },
  notes: { type: String },
});

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, unique: true },
    patientName: { type: String, required: true },
    doctorAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],

    familyHistory: {
      hasFamilyDisease: { type: Boolean, default: false },
      parentsRelated: { type: Boolean, default: false },
    },

    patientHistory: {
      gender: { type: String, enum: ["Male", "Female", "Prefer not to say"], default: "Prefer not to say" },
      unhealthyBehaviours: { type: String },
      residency: { type: String },
      occupation: { type: String },
      married: { type: Boolean },
      haveChildren: { type: Boolean },
    },

    records: [recordSchema],
  },
  { timestamps: true }
);

const MedicalHistory = mongoose.model("MedicalHistory", medicalHistorySchema);
export default MedicalHistory;
