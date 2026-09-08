/**
 * Utility to compress and optimize avatar data URLs in the browser
 * Keeps image payloads lightweight (~10-25 KB instead of 2-5 MB)
 * preventing browser localStorage QuotaExceededError and Supabase network timeouts.
 */
export async function optimizeAvatarDataUrl(
  dataUrl: string,
  maxWidth = 200,
  maxHeight = 200,
  quality = 0.75
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  if (!dataUrl.startsWith('data:image')) return dataUrl; // Normal HTTP URLs (Cloudinary, etc.) don't need resizing

  // If the base64 string is already very small (e.g. under 30 KB), keep it
  if (dataUrl.length < 40000) return dataUrl;

  if (typeof window === 'undefined' || !window.document) return dataUrl;

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (!w || !h) return resolve(dataUrl);

          // Center crop / cover to 1:1 aspect ratio
          const targetW = maxWidth;
          const targetH = maxHeight;
          let sX = 0;
          let sY = 0;
          let sW = w;
          let sH = h;

          if (w > h) {
            sW = h;
            sX = Math.round((w - h) / 2);
          } else {
            sH = w;
            sY = Math.max(0, Math.round((h - w) * 0.25)); // Slight upper bias for faces/berets
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetW, targetH);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}
