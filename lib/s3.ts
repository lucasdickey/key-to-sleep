import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "key-to-sleep-assets";

// Helper to generate S3 keys with proper structure
// Uses "sleep-stories" prefix to keep this project's files organized
export function generateS3Key(
  jobToken: string,
  assetType: string,
  extension: string
): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `sleep-stories/${date}/${jobToken}/${assetType}.${extension}`;
}

// Upload file to S3
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    // Make assets publicly readable
    ACL: "public-read",
  });

  try {
    await s3Client.send(command);
    // Return the public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

// Get a pre-signed URL for temporary access (if needed for private buckets)
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

// Upload text content (stories, metadata)
export async function uploadTextToS3(
  jobToken: string,
  assetType: "story" | "metadata" | "artwork-prompt",
  content: string
): Promise<string> {
  const key = generateS3Key(jobToken, assetType, "txt");
  const url = await uploadToS3(key, content, "text/plain; charset=utf-8");
  return url;
}

// Upload JSON content
export async function uploadJsonToS3(
  jobToken: string,
  assetType: string,
  content: Record<string, unknown>
): Promise<string> {
  const key = generateS3Key(jobToken, assetType, "json");
  const jsonString = JSON.stringify(content, null, 2);
  const url = await uploadToS3(key, jsonString, "application/json");
  return url;
}

// Upload binary content (audio, images)
export async function uploadBinaryToS3(
  jobToken: string,
  assetType: "audio" | "artwork",
  buffer: Buffer,
  mimeType: string,
  extension: string
): Promise<string> {
  const key = generateS3Key(jobToken, assetType, extension);
  const url = await uploadToS3(key, buffer, mimeType);
  return url;
}

// Asset type mappings
export const ASSET_EXTENSIONS = {
  story: "txt",
  metadata: "json",
  "artwork-prompt": "txt",
  artwork: "png",
  audio: "mp3",
} as const;

export const ASSET_MIME_TYPES = {
  story: "text/plain",
  metadata: "application/json",
  "artwork-prompt": "text/plain",
  artwork: "image/png",
  audio: "audio/mpeg",
} as const;
