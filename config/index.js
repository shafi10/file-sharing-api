import path from "path";

// Define environment variables
export const PORT = process.env.PORT || 3000;
export const FOLDER =
  process.env.FOLDER || path.resolve(process.cwd(), "uploads");
export const UPLOAD_LIMIT = process.env.UPLOAD_LIMIT || "10mb"; // Example limit
export const DOWNLOAD_LIMIT = process.env.DOWNLOAD_LIMIT || "10mb"; // Example limit
export const INACTIVITY_PERIOD = parseInt(
  process.env.INACTIVITY_PERIOD || "7",
  10
); // In days
export const CLEANUP_CRON_SCHEDULE =
  process.env.CLEANUP_CRON_SCHEDULE || "*/1 * * * *";
export const provider = process.env.PROVIDER || "local";
export const configPath = process.env.CONFIG;
