import fs from "fs/promises";
import path from "path";
import { INACTIVITY_PERIOD, FOLDER } from "../config/index.js";

/**
 * Performs cleanup of old files based on inactivity period.
 */
export async function cleanupFiles() {
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
          const filePath = path.resolve(FOLDER, metadata.filename);
          await fs.unlink(filePath);
          await fs.unlink(metadataPath);
          console.log(`Deleted: ${filePath} and ${metadataPath}`);
        }
      }
    }
    console.log("Cleanup completed successfully.");
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}
