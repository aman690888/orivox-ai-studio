import { uploadFile, deleteFile, getPublicUrl } from "./core";

const BUCKET_NAME = "presentation-thumbnails";

const THUMBNAIL_VALIDATION = {
  maxSizeBytes: 3 * 1024 * 1024, // 3MB
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  dimensions: {
    minWidth: 320,
    minHeight: 180,
    maxWidth: 3840,
    maxHeight: 2160,
  },
};

export async function uploadThumbnail(
  userId: string,
  presentationId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const path = `${userId}/${presentationId}/thumbnail_${Date.now()}.${fileExt}`;

  const uploadedPath = await uploadFile(BUCKET_NAME, path, file, {
    validation: THUMBNAIL_VALIDATION,
    onProgress,
    upsert: true,
  });

  return getPublicUrl(BUCKET_NAME, uploadedPath);
}

export async function deleteThumbnail(path: string): Promise<void> {
  const pathPart = path.includes(BUCKET_NAME) ? path.split(`${BUCKET_NAME}/`).pop() : path;

  if (pathPart) {
    await deleteFile(BUCKET_NAME, pathPart);
  }
}

export function getThumbnailUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return getPublicUrl(BUCKET_NAME, path);
}
