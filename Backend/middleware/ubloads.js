import multer from "multer";
import path from "path";

// دالة عامة لإنشاء storage حسب الفولدر
const createStorage = (folderName, customName = false) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folderName}`);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      if (customName) {
        cb(null, file.fieldname + "-" + Date.now() + ext);
      } else {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + ext);
      }
    },
  });

// فلتر عام للصور
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// فلتر عام للصور + PDF
const imagePdfFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, png, pdf allowed!"), false);
  }
};

// إعدادات لكل نوع
export const uploadPrescription = multer({
  storage: createStorage("prescriptions"),
  fileFilter: imagePdfFilter,
});

export const uploadDoctor = multer({
  storage: createStorage("doctors", true),
  fileFilter: imageFilter,
});

export const uploadPatient = multer({
  storage: createStorage("patients"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});
