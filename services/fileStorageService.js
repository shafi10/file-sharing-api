import fs from "fs";
import GoogleCloudStorageService from "./googleCloudStorage.js";
import LocalFileService from "./localFileService.js";
import crypto from "crypto";

// Class to handle file storage logic based on the selected provider
class FileStorageService {
  constructor(config) {
    this.provider = config.PROVIDER;
    if (this.provider === "google") {
      // If Google provider is selected, instantiate GoogleCloudStorageService
      this.service = new GoogleCloudStorageService(config.CONFIG);
    } else if (this.provider === "local") {
      // If Local provider is selected, instantiate LocalFileService
      this.service = new LocalFileService();
      this.folder = config.FOLDER;
      if (!fs.existsSync(this.folder)) {
        fs.mkdirSync(this.folder, { recursive: true });
      }
    } else {
      throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async generateKeys(filename) {
    const publicKey = crypto
      .createHash("sha256")
      .update(filename)
      .digest("hex");
    const privateKey = crypto
      .createHash("sha256")
      .update(`${filename}-${Date.now()}`)
      .digest("hex");
    return { publicKey, privateKey };
  }

  async saveKeys(filename, keys, file) {
    if (this.provider === "local") {
      await this.service.saveKeys(filename, keys);
      const filePath = `${this.folder}/${filename}`;
      fs.writeFileSync(filePath, file.buffer || fs.readFileSync(file.path));
    } else if (this.provider === "google") {
      await this.service.saveKeys(filename, keys, file);
    }
  }

  async getFileByPublicKey(publicKey) {
    return this.service.getFileByPublicKey(publicKey);
  }

  async deleteFileByPrivateKey(privateKey) {
    return this.service.deleteFileByPrivateKey(privateKey);
  }
}

export default FileStorageService;
