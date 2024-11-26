import express from "express";
import crypto from "crypto";
import path from "path";
import rateLimit from "express-rate-limit";
import multer from "multer";
import {
  downloadExistingFile,
  removeExistingFile,
  uploadNewFile,
} from "../controllers/fileController.js";

const FOLDER = process.env.FOLDER || path.resolve(process.cwd(), "uploads");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: FOLDER,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Rate limit setup for uploads and downloads
const uploadLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 10, // Limit each IP to 100 requests per day
  message: "Daily upload limit exceeded.",
});

const downloadLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 10, // Limit each IP to 200 requests per day
  message: "Daily download limit exceeded.",
});

const router = express.Router();

// POST /files - Upload new files
router.post("/", uploadLimit, upload.single("file"), uploadNewFile);

// GET /files/:publicKey - Download existing files
router.get("/:publicKey", downloadLimit, downloadExistingFile);

// DELETE /files/:privateKey - Remove existing files
router.delete("/:privateKey", removeExistingFile);

export default router;
