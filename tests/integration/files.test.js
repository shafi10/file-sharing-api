import request from "supertest";
import app from "../../server.js"; // Replace with the actual Express app instance
import fs from "fs";

// Mock file buffer for upload
const mockFileBuffer = Buffer.from("Mock file content", "utf-8");
const mockFilePath = "mockfile.txt";

// Ensure temp directory exists for testing
const tempDir = "./temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Helper to write a mock file for testing
fs.writeFileSync(`${tempDir}/${mockFilePath}`, mockFileBuffer);

describe("File Service Integration Tests", () => {
  let publicKey;
  let privateKey;

  test("POST /files - Upload a new file", async () => {
    const response = await request(app)
      .post("/files")
      .attach("file", `${tempDir}/${mockFilePath}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("publicKey");
    expect(response.body).toHaveProperty("privateKey");

    publicKey = response.body.publicKey;
    privateKey = response.body.privateKey;
  });

  test("GET /files/:publicKey - Download the uploaded file", async () => {
    const response = await request(app).get(`/files/${publicKey}`);

    expect(response.status).toBe(200);
  });

  test("DELETE /files/:privateKey - Remove the uploaded file", async () => {
    const response = await request(app).delete(`/files/${privateKey}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("File deleted successfully.");
  });
});

afterAll(() => {
  // Cleanup temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
