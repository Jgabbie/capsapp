import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, "../uploads/applications");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];

const applicationFileFilter = (_req, file, cb) => {
  const hasAllowedMime = allowedMimeTypes.has((file.mimetype || "").toLowerCase());
  const extension = path.extname(file.originalname || "").toLowerCase();
  const hasAllowedExtension = allowedExtensions.includes(extension);

  if (!hasAllowedMime && !hasAllowedExtension) {
    cb(new Error("Invalid file type. Allowed: PDF, JPG, JPEG, PNG, DOC, DOCX"));
    return;
  }

  cb(null, true);
};

const applicationUpload = multer({
  storage,
  fileFilter: applicationFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default applicationUpload;