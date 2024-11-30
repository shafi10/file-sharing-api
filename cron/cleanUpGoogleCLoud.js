import { configPath, INACTIVITY_PERIOD } from "../config/index.js";
import GoogleCloudStorageService from "../services/googleCloudStorage.js";

const FileService = new GoogleCloudStorageService(configPath);

export async function cleanupGoogleCloudFiles() {
  try {
    const now = Date.now();
    const [files] = await FileService.bucket.getFiles();

    for (const file of files) {
      if (file.name.endsWith(".meta.json")) {
        const [metadataContent] = await file.download();
        const metadata = JSON.parse(metadataContent);

        const uploadDate = new Date(metadata.uploadDate).getTime();
        const ageInDays = (now - uploadDate) / (1000 * 60 * 60 * 24);

        if (ageInDays > INACTIVITY_PERIOD) {
          await FileService.deleteFileByPrivateKey(metadata?.privateKey);
        }
      }
    }
    console.log("Google Cloud Storage cleanup completed successfully.");
  } catch (err) {
    console.error("Error during Google Cloud Storage cleanup:", err);
  }
}
