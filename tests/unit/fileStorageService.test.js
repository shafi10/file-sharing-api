jest.mock("../../services/googleCloudStorage.js");
jest.mock("../../services/localFileService.js");
import GoogleCloudStorageService from "../../services/googleCloudStorage.js";
import LocalFileService from "../../services/localFileService.js";
import FileStorageService from "../../services/fileStorageService.js";
import { configPath, FOLDER, provider } from "../../config/index.js";
import fs from "fs";

describe("FileStorageService Unit Tests", () => {
  let service;
  const mockConfig = {
    PROVIDER: provider,
    FOLDER: FOLDER,
    CONFIG: configPath,
  };

  beforeEach(() => {
    service = new FileStorageService(mockConfig);
    LocalFileService.mockClear();
    GoogleCloudStorageService.mockClear();
  });

  it("should initialize with LocalFileService for 'local' provider", () => {
    expect(service.service).toBeInstanceOf(LocalFileService);
  });

  it("should initialize with GoogleCloudStorageService for 'google' provider", () => {
    const googleConfig = { ...mockConfig, PROVIDER: "google" };
    const googleService = new FileStorageService(googleConfig);
    expect(googleService.service).toBeInstanceOf(GoogleCloudStorageService);
  });

  it("should generate unique keys", async () => {
    const filename = "testFile.txt";
    const keys = await service.generateKeys(filename);

    expect(keys).toHaveProperty("publicKey");
    expect(keys).toHaveProperty("privateKey");
    expect(keys.publicKey).toEqual(
      expect.stringMatching(/^[a-f0-9]{64}$/) // SHA-256 hash
    );
    expect(keys.privateKey).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
  });

  it("should save file and metadata for 'local' provider", async () => {
    const filename = "testFile.txt";
    const file = { path: "./testFile.txt", buffer: Buffer.from("content") };
    const keys = { publicKey: "publicKey123", privateKey: "privateKey123" };

    jest.spyOn(LocalFileService.prototype, "saveKeys").mockResolvedValue();
    jest.spyOn(fs, "writeFileSync").mockImplementation();

    await service.saveKeys(filename, keys, file);

    expect(LocalFileService.prototype.saveKeys).toHaveBeenCalledWith(
      filename,
      keys
    );
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("should handle file retrieval by publicKey", async () => {
    const mockFileData = {
      metadata: { filename: "testFile.txt" },
      filePath: "./uploads/testFile.txt",
    };

    jest
      .spyOn(LocalFileService.prototype, "getFileByPublicKey")
      .mockResolvedValue(mockFileData);

    const fileData = await service.getFileByPublicKey("publicKey123");
    expect(fileData).toEqual(mockFileData);
  });

  it("should handle file deletion by privateKey", async () => {
    const mockMetadata = {
      filename: "testFile.txt",
      privateKey: "privateKey123",
    };

    jest
      .spyOn(LocalFileService.prototype, "deleteFileByPrivateKey")
      .mockResolvedValue(mockMetadata);

    const result = await service.deleteFileByPrivateKey("privateKey123");
    expect(result).toEqual(mockMetadata);
  });
});
