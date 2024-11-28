import express from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import multer from "multer";
import {
  downloadExistingFile,
  removeExistingFile,
  uploadNewFile,
} from "../controllers/fileController.js";
import { DOWNLOAD_LIMIT, FOLDER, UPLOAD_LIMIT } from "../config/index.js";

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: FOLDER,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Rate limiters
const uploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(UPLOAD_LIMIT),
  message: "Upload limit exceeded",
});

const downloadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(DOWNLOAD_LIMIT),
  message: "Download limit exceeded",
});

const router = express.Router();

// POST /files - Upload new files
router.post("/", uploadLimiter, upload.single("file"), uploadNewFile);

// GET /files/:publicKey - Download existing files
router.get("/:publicKey", downloadLimiter, downloadExistingFile);

// DELETE /files/:privateKey - Remove existing files
router.delete("/:privateKey", removeExistingFile);

export default router;
