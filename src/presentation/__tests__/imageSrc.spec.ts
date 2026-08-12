import { describe, expect, test } from "vitest";
import { isSafeImageSrc } from "../imageSrc";

describe("isSafeImageSrc", () => {
  test("accepts blob URLs used for receipt previews", () => {
    expect(isSafeImageSrc("blob:http://localhost:1420/abc-123")).toBe(true);
  });

  test("accepts data URLs for raster image types", () => {
    expect(isSafeImageSrc("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
    expect(isSafeImageSrc("data:image/jpeg;base64,/9j/4AAQ==")).toBe(true);
    expect(isSafeImageSrc("data:image/webp;base64,UklGR")).toBe(true);
  });

  test("rejects javascript URLs", () => {
    expect(isSafeImageSrc("javascript:alert(1)")).toBe(false);
  });

  test("rejects file and remote URLs", () => {
    expect(isSafeImageSrc("file:///etc/passwd")).toBe(false);
    expect(isSafeImageSrc("https://evil.example/x.png")).toBe(false);
    expect(isSafeImageSrc("http://evil.example/x.png")).toBe(false);
  });

  test("rejects SVG data URLs and non-image data URLs", () => {
    expect(isSafeImageSrc("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isSafeImageSrc("data:text/html;base64,PGh0bWw+")).toBe(false);
  });

  test("rejects empty and relative sources", () => {
    expect(isSafeImageSrc("")).toBe(false);
    expect(isSafeImageSrc("receipts/1.jpg")).toBe(false);
  });
});
