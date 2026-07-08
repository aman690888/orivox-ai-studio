import { uploadFile, deleteFile, getPublicUrl, createSignedUrl } from "./core";

const BUCKET_NAME = "presentation-assets";

const ASSET_VALIDATION = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"],
};

export async function uploadPresentationAsset(
  userId: string,
  presentationId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const path = `${userId}/${presentationId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

  const uploadedPath = await uploadFile(BUCKET_NAME, path, file, {
    validation: ASSET_VALIDATION,
    onProgress,
    upsert: true,
  });

  return uploadedPath;
}

export async function deletePresentationAsset(path: string): Promise<void> {
  const pathPart = path.includes(BUCKET_NAME) ? path.split(`${BUCKET_NAME}/`).pop() : path;

  if (pathPart) {
    await deleteFile(BUCKET_NAME, pathPart);
  }
}

export function getPresentationAssetPublicUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return getPublicUrl(BUCKET_NAME, path);
}

export async function getPresentationAssetSignedUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const pathPart = path.includes(BUCKET_NAME) ? path.split(`${BUCKET_NAME}/`).pop() : path;

  if (!pathPart) {
    throw new Error("Invalid asset path for generating signed URL");
  }

  return createSignedUrl(BUCKET_NAME, pathPart, expiresInSeconds);
}
