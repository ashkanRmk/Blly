/** Receipt image helpers: validation + client-side downscale/compress to a data URL. */

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
const MAX_DIMENSION = 1400; // px — plenty for reading a receipt
const JPEG_QUALITY = 0.72;

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode-failed'));
    img.src = src;
  });
}

/**
 * Read a receipt image file, downscale it to a sane size and re-encode as JPEG to keep
 * persisted payloads small. Falls back to the original data URL if the browser can't
 * decode the format (e.g. some HEIC images on non-Apple platforms).
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file);
  try {
    const img = await loadImage(original);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } catch {
    return original;
  }
}
