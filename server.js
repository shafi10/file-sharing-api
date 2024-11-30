import "dotenv/config";
// Import statements using ES Modules
import express from "express";
import fs from "fs";
import fileRouter from "./routes/fileRouter.js";
import { CLEANUP_CRON_SCHEDULE, FOLDER, PORT } from "./config/index.js";
import { cleanupFiles } from "./cron/index.js";
import schedule from "node-schedule";

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Ensure FOLDER exists
if (!fs.existsSync(FOLDER)) {
  fs.mkdirSync(FOLDER, { recursive: true });
}

// API Endpoints
app.use("/files", fileRouter);

// Schedule cleanup job
schedule.scheduleJob(CLEANUP_CRON_SCHEDULE, async () => {
  await cleanupFiles();
});

// Export the app to be used in tests
export default app;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
