import path from "path";
import fs from "fs";
import mime from "mime-types";
import LocalFileService from "../services/localFileService.js";
import { configPath, FOLDER, provider } from "../config/index.js";
import GoogleCloudStorageService from "../services/googleCloudStorage.js";

const FileService =
  provider === "google"
    ? new GoogleCloudStorageService(configPath)
    : LocalFileService;

export const uploadNewFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const keys = await FileService.generateKeys(file.filename);
    FileService.saveKeys(file.filename, keys, file);

    res.json({ publicKey: keys.publicKey, privateKey: keys.privateKey });
  } catch (error) {
    console.log("🚀 ~ uploadNewFile ~ error:", error);
    res.status(400).json({ error: "Something went wrong" });
  }
};

export const downloadExistingFile = (req, res) => {
  const { publicKey } = req.params;
  const metadata = FileService.getFileByPublicKey(publicKey);

  if (!metadata) {
    return res.status(404).json({ error: "Something went wrong." });
  }

  const filePath = path.join(FOLDER, metadata.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  // Determine the MIME type of the file
  const mimeType = mime.lookup(filePath);
  if (!mimeType) {
    return res.status(400).json({ error: "Unable to determine file type" });
  }

  // Set the correct headers for file download
  res.setHeader("Content-Type", mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${path.basename(filePath)}"`
  ); // To prompt download

  // Stream the file to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res); // Pipe the file stream to the response object
};

export const removeExistingFile = (req, res) => {
  const { privateKey } = req.params;
  const metadata = FileService.deleteFileByPrivateKey(privateKey);

  if (!metadata) {
    return res
      .status(404)
      .json({ error: "File not found or already deleted." });
  }

  res.json({ message: "File deleted successfully." });
};
