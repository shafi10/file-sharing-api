import { provider } from "../config/index.js";
import { cleanupGoogleCloudFiles } from "./cleanUpGoogleCLoud.js";
import { cleanUpLocalFiles } from "./cleanUpLocalFiles.js";

/**
 * Performs cleanup of old files based on inactivity period.
 */
export async function cleanupFiles() {
  if (provider === "google") {
    cleanupGoogleCloudFiles();
  } else {
    cleanUpLocalFiles();
  }
}
