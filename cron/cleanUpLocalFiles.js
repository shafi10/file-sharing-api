import fs from "fs/promises";
import path from "path";
import { INACTIVITY_PERIOD, FOLDER } from "../config/index.js";
import LocalFileService from "../services/localFileService.js";

const FileService = new LocalFileService();

export async function cleanUpLocalFiles() {
  try {
    const now = Date.now();
    const files = await fs.readdir(FOLDER);

    for (const file of files) {
      if (file.endsWith(".meta.json")) {
        const metadataPath = path.resolve(FOLDER, file);
        const metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8"));

        const uploadDate = new Date(metadata.uploadDate).getTime();
        const ageInDays = (now - uploadDate) / (1000 * 60 * 60 * 24);

        if (ageInDays > INACTIVITY_PERIOD) {
          await FileService?.deleteFileByPrivateKey(metadata?.privateKey);
        }
      }
    }
    console.log("Cleanup completed successfully.");
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}
