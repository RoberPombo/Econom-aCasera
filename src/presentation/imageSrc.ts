const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
];

export function isSafeImageSrc(source: string): boolean {
  if (source.startsWith("blob:")) return true;
  return ALLOWED_IMAGE_MIME_TYPES.some((mime) =>
    source.startsWith(`data:${mime};`),
  );
}
