import fs from "fs";
import mime from "mime-types";
import { uniqueSuffix } from "../utils/index.js";
import FileStorageService from "../services/fileStorageService.js";
import { configPath, provider, FOLDER } from "../config/index.js";

const config = {
  PROVIDER: provider, // "local" or "googleCloud"
  CONFIG: configPath, // Path to Google Cloud configuration
  FOLDER: FOLDER, // Path to local storage folder
};

const FileService = new FileStorageService(config);

export const uploadNewFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const uniqueFileName = `${uniqueSuffix}-${file?.originalname}`;
    const fileName = provider === "google" ? uniqueFileName : file.filename;
    const keys = await FileService.generateKeys(fileName);
    await FileService.saveKeys(fileName, keys, file);

    res.json({ publicKey: keys.publicKey, privateKey: keys.privateKey });
  } catch (error) {
    console.log("🚀 ~ uploadNewFile ~ error:", error);
    res.status(400).json({ error: "Something went wrong" });
  }
};

export const downloadExistingFile = async (req, res) => {
  const { publicKey } = req.params;

  if (!publicKey) {
    return res.status(400).json({ error: "Public key is required" });
  }
  try {
    // Retrieve file info using the public key
    const fileInfo = await FileService.getFileByPublicKey(publicKey);

    if (!fileInfo) {
      return res.status(404).json({ error: "File not found" });
    }

    // Determine the MIME type of the file
    const mimeType =
      mime.lookup(fileInfo?.metadata?.filename) || "application/octet-stream";

    // Set the correct headers for file download
    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileInfo?.metadata?.filename}"`
    );

    let fileStream = null;
    if (provider === "google") {
      // Stream the file to the response
      fileStream = fileInfo?.filePath?.createReadStream();
    } else {
      // Stream the file to the response
      fileStream = fs.createReadStream(fileInfo?.filePath);
      // Pipe the file stream to the response object
    }
    // Handle file stream errors
    fileStream.on("error", (err) => {
      console.error("Error streaming file:", err.message);
      return res.status(500).json({ error: "Error streaming the file" });
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error in downloadExistingFile:", error.message);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
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
