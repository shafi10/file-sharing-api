import "dotenv/config";
// Import statements using ES Modules
import express from "express";
import fs from "fs";
import path from "path";
import fileRouter from "./routes/fileRouter.js";

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const FOLDER = process.env.FOLDER || path.resolve(process.cwd(), "uploads");

// Ensure FOLDER exists
if (!fs.existsSync(FOLDER)) {
  fs.mkdirSync(FOLDER, { recursive: true });
}

// API Endpoints
app.use("/files", fileRouter);

// Scheduled cleanup of inactive files
const cleanupInterval = 24 * 60 * 60 * 1000; // 1 day
setInterval(() => {
  const metaFiles = fs
    .readdirSync(FOLDER)
    .filter((file) => file.endsWith(".meta.json"));
  for (const metaFile of metaFiles) {
    const metaPath = path.join(FOLDER, metaFile);
    const metadata = JSON.parse(fs.readFileSync(metaPath));
    const filePath = path.join(FOLDER, metadata.filename);
    const fileStats = fs.statSync(filePath);

    // Delete files inactive for 7 days
    if (Date.now() - fileStats.mtimeMs > 7 * 24 * 60 * 60 * 1000) {
      fs.unlinkSync(filePath);
      fs.unlinkSync(metaPath);
    }
  }
}, cleanupInterval);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
