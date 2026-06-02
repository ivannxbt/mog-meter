export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Client-side limit aligned with API (8 MB). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Solo se permiten imágenes JPG, PNG o WebP.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "La imagen no puede superar 8 MB.";
  }
  return null;
}
