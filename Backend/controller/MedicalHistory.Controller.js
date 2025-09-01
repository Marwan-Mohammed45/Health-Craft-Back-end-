import MedicalHistory from "../models/medicalHistory.js";
import cloudinary from "../middleware/cloudnairy.js";

const medicalController = {
  addRecord: async (req, res) => {
    try {
      const { title, description, notes } = req.body;
      let { familyHistory, patientHistory } = req.body;

      // لو فيه صورة روشتة مرفوعة، نرفعها على Cloudinary
      let prescriptionUrl = null;
      if (req.file) {
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "prescriptions",
            resource_type: "image",
          });
          prescriptionUrl = uploadResult.secure_url;
        } catch (err) {
          console.error("Cloudinary upload error:", err);
          return res.status(500).json({ success: false, message: "Failed to upload prescription image" });
        }
      }

      // لو فيه JSON جاي كـ String
      try {
        if (typeof familyHistory === "string") familyHistory = JSON.parse(familyHistory);
        if (typeof patientHistory === "string") patientHistory = JSON.parse(patientHistory);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid JSON format" });
      }

      if (!title) return res.status(400).json({ success: false, message: "Title is required" });

      const patientId = req.patient._id;
      const patientName = req.patient.name;

      let history = await MedicalHistory.findOne({ patientId });
      if (!history) {
        history = new MedicalHistory({ patientId, patientName, familyHistory, patientHistory, records: [] });
      } else {
        if (familyHistory) history.familyHistory = familyHistory;
        if (patientHistory) history.patientHistory = patientHistory;
      }

      // إضافة الروشتة لو موجودة
      history.records.push({ title, description, notes, prescription: prescriptionUrl });
      await history.save();

      const record = history.records.at(-1);
      res.status(201).json({
        success: true,
        message: "Medical record added successfully",
        patient: { id: patientId, name: patientName },
        record,
      });
    } catch (err) {
      console.error("AddRecord error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  updateRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const patientId = req.patient._id;
      const history = await MedicalHistory.findOne({ patientId });
      if (!history) return res.status(404).json({ success: false, message: "No medical history found" });

      const record = history.records.id(id);
      if (!record) return res.status(404).json({ success: false, message: "Record not found" });

      const { title, description, notes } = req.body;

      // لو فيه صورة جديدة، نرفعها على Cloudinary
      let prescriptionUrl = record.prescription;
      if (req.file) {
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "prescriptions",
            resource_type: "image",
          });
          prescriptionUrl = uploadResult.secure_url;
        } catch (err) {
          console.error("Cloudinary upload error:", err);
          return res.status(500).json({ success: false, message: "Failed to upload prescription image" });
        }
      }

      if (title) record.title = title;
      if (description) record.description = description;
      if (notes) record.notes = notes;
      record.prescription = prescriptionUrl;

      await history.save();
      res.json({ success: true, message: "Record updated successfully", record });
    } catch (err) {
      console.error("UpdateRecord error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getHistory: async (req, res) => {
    try {
      const patientId = req.patient._id;
      const history = await MedicalHistory.findOne({ patientId });
      if (!history) return res.status(404).json({ success: false, message: "No medical history found" });

      res.json({
        success: true,
        patient: {
          id: history.patientId,
          name: history.patientName,
          familyHistory: history.familyHistory,
          patientHistory: history.patientHistory,
        },
        records: history.records,
      });
    } catch (err) {
      console.error("GetHistory error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

export default medicalController;
