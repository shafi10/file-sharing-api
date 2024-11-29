import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// Google Cloud Storage provider component
class GoogleCloudStorageService {
  constructor(configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found at ${configPath}`);
    }

    const config = JSON.parse(fs.readFileSync(configPath));
    this.bucketName = config.bucket;
    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
    this.bucket = this.storage.bucket(this.bucketName);
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
    try {
      const metadata = {
        filename,
        uploadDate: new Date().toISOString(),
        ...keys,
      };
      const metaFileName = `${keys.publicKey}.meta.json`;
      const metaFile = this.bucket.file(metaFileName);
      const uploadedFile = this.bucket.file(filename);
      await uploadedFile.save(file.buffer || fs.readFileSync(file.path), {
        contentType: file.mimetype || "application/octet-stream",
      });
      await metaFile.save(JSON.stringify(metadata), {
        contentType: "application/json",
      });
    } catch (error) {
      console.log("🚀 ~ GoogleCloudStorageService ~ saveKeys ~ error:", error);
    }
  }

  async getFileByPublicKey(publicKey) {
    const metaFileName = `${publicKey}.meta.json`;
    const metaFile = this.bucket.file(metaFileName);

    if (await metaFile.exists()) {
      const [metadataContent] = await metaFile.download();
      return JSON.parse(metadataContent);
    }

    return null;
  }

  async deleteFileByPrivateKey(privateKey) {
    const [files] = await this.bucket.getFiles({
      prefix: "",
    });

    for (const file of files) {
      if (file.name.endsWith(".meta.json")) {
        const [metadataContent] = await file.download();
        const metadata = JSON.parse(metadataContent);

        if (metadata.privateKey === privateKey) {
          await this.bucket.file(metadata.filename).delete();
          await file.delete();
          return metadata;
        }
      }
    }

    return null;
  }
}

export default GoogleCloudStorageService;
