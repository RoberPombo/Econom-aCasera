export function isSafeImageSrc(source: string): boolean {
  return (
    source.startsWith("blob:") ||
    (source.startsWith("data:image/") && !source.startsWith("data:image/svg"))
  );
}
