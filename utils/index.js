import crypto from "crypto";
export const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
