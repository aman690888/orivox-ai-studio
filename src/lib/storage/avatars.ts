import { uploadFile, deleteFile, getPublicUrl } from "./core";

const BUCKET_NAME = "avatars";

const AVATAR_VALIDATION = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  dimensions: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 2048,
    maxHeight: 2048,
  },
};

export async function uploadAvatar(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const path = `${userId}/avatar_${Date.now()}.${fileExt}`;

  // We can delete previous files in the user folder if needed, but since it's client-side,
  // we will upload the new avatar and return its public URL.
  const uploadedPath = await uploadFile(BUCKET_NAME, path, file, {
    validation: AVATAR_VALIDATION,
    onProgress,
    upsert: true,
  });

  return getPublicUrl(BUCKET_NAME, uploadedPath);
}

export async function deleteAvatar(path: string): Promise<void> {
  // Extract path relative to bucket if a full URL is supplied
  const pathPart = path.includes(BUCKET_NAME) ? path.split(`${BUCKET_NAME}/`).pop() : path;

  if (pathPart) {
    await deleteFile(BUCKET_NAME, pathPart);
  }
}

export function getAvatarUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return getPublicUrl(BUCKET_NAME, path);
}
