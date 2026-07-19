import { supabase } from "../supabase";

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  dimensions?: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

export async function validateFile(
  file: File,
  options?: FileValidationOptions,
): Promise<string | null> {
  if (!options) return null;

  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    return `File size exceeds the limit of ${Math.round(options.maxSizeBytes / 1024 / 1024)}MB.`;
  }

  if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
    return `File type "${file.type}" is not supported.`;
  }

  if (options.dimensions && file.type.startsWith("image/")) {
    const isValidDimensions = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const { minWidth, minHeight, maxWidth, maxHeight } = options.dimensions!;
        if (minWidth && img.width < minWidth) return resolve(false);
        if (minHeight && img.height < minHeight) return resolve(false);
        if (maxWidth && img.width > maxWidth) return resolve(false);
        if (maxHeight && img.height > maxHeight) return resolve(false);
        resolve(true);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
    });

    if (!isValidDimensions) {
      return "Image dimensions do not meet the requirements.";
    }
  }

  return null;
}

export interface UploadOptions {
  validation?: FileValidationOptions;
  onProgress?: (progress: number) => void;
  upsert?: boolean;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: UploadOptions,
): Promise<string> {
  if (options?.validation) {
    const validationError = await validateFile(file, options.validation);
    if (validationError) throw new Error(validationError);
  }

  const uploadOptions: {
    upsert: boolean;
    onUploadProgress?: (progressEvent: { loaded: number; total: number }) => void;
  } = {
    upsert: options?.upsert ?? true,
  };

  if (options?.onProgress) {
    uploadOptions.onUploadProgress = (progressEvent) => {
      const percent = (progressEvent.loaded / progressEvent.total) * 100;
      options.onProgress?.(percent);
    };
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, uploadOptions);

  if (error) {
    console.error(`Storage upload error in bucket "${bucket}":`, error);
    throw error;
  }

  return data.path;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`Storage deletion error in bucket "${bucket}":`, error);
    throw error;
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) {
    console.error(`Signed URL creation error in bucket "${bucket}":`, error);
    throw error;
  }
  return data.signedUrl;
}
