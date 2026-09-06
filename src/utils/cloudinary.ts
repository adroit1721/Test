/**
 * Cloudinary Integration Utility for NGDC-BNCC Portal
 * Supports direct unsigned upload to Cloudinary using upload_preset
 * Falls back to persistent base64 data-url if Cloudinary credentials are not configured yet.
 */

export interface CloudinaryUploadResponse {
  url: string;
  publicId?: string;
  source: 'cloudinary' | 'local_fallback';
  error?: string;
}

/**
 * Retrieve Cloudinary configuration.
 * First tries Supabase site_settings, then falls back to Vite env variables.
 */
export function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();
  return { cloudName, uploadPreset };
}

export function isCloudinaryConfigured(): boolean {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
}

/**
 * Upload an image file to Cloudinary
 * @param file - File or Blob object
 * @param folder - Cloudinary folder (e.g., 'ngdc_bncc/cadets')
 */
export async function uploadImageToCloudinary(
  file: File | Blob,
  folder = 'ngdc_bncc'
): Promise<CloudinaryUploadResponse> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    source: 'cloudinary',
  };
}

/**
 * Helper to convert a file to Data URL
 */
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
