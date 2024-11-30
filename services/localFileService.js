import fs from "fs";
import path from "path";
import crypto from "crypto";
import { FOLDER } from "../config/index.js";

// File component (encapsulates file operations)
class LocalFileService {
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

  async saveKeys(filename, keys) {
    const metaPath = path.join(FOLDER, `${keys.publicKey}.meta.json`);
    fs.writeFileSync(
      metaPath,
      JSON.stringify({ filename, uploadDate: new Date(), ...keys })
    );
  }

  async getFileByPublicKey(publicKey) {
    const metaPath = path.join(FOLDER, `${publicKey}.meta.json`);
    if (fs.existsSync(metaPath)) {
      const metadata = JSON.parse(fs.readFileSync(metaPath));
      const filePath = path.join(FOLDER, metadata.filename);
      return { metadata, filePath };
    }
    console.log("falknfjlajf lakflaj");
    return null;
  }

  async deleteFileByPrivateKey(privateKey) {
    const metaFiles = fs
      .readdirSync(FOLDER)
      .filter((file) => file.endsWith(".meta.json"));
    for (const metaFile of metaFiles) {
      const metaPath = path.join(FOLDER, metaFile);
      const metadata = JSON.parse(fs.readFileSync(metaPath));
      if (metadata.privateKey === privateKey) {
        fs.unlinkSync(path.join(FOLDER, metadata.filename));
        fs.unlinkSync(metaPath);
        return metadata;
      }
    }
    return null;
  }
}

export default LocalFileService;
