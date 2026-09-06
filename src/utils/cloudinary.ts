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
export async function getCloudinaryConfig(): Promise<{ cloudName: string; uploadPreset: string }> {
  // Load from Supabase site_settings if possible
  const { supabase } = await import('./supabaseClient').then(m => ({ supabase: m.getSupabaseClient?.() }));
  let cloudName = '';
  let uploadPreset = '';
  if (supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, value')
      .in('id', ['ngdc_cloudinary_cloud_name', 'ngdc_cloudinary_upload_preset']);
    if (!error && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row.id === 'ngdc_cloudinary_cloud_name') cloudName = row.value;
        if (row.id === 'ngdc_cloudinary_upload_preset') uploadPreset = row.value;
      });
    }
  }
  // Env fallback (Vite) – useful for local dev
  const metaEnv = (import.meta as any).env || {};
  const envCloudName = metaEnv.VITE_CLOUDINARY_CLOUD_NAME || '';
  const envUploadPreset = metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || '';

  return {
    cloudName: (envCloudName || localCloudName || '').trim(),
    uploadPreset: (envUploadPreset || localUploadPreset || '').trim(),
  };
}

export function isCloudinaryConfigured(): boolean {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.uploadPreset);
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

  // If Cloudinary is configured with cloud_name and upload_preset
  if (cloudName && uploadPreset) {
    try {
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
    } catch (err: any) {
      console.warn('Cloudinary upload failed, falling back to local storage:', err);
      // Fallback to local Data URL
      const dataUrl = await fileToDataUrl(file);
      return {
        url: dataUrl,
        source: 'local_fallback',
        error: err?.message || 'Upload to Cloudinary failed. Stored locally.',
      };
    }
  }

  // Fallback: Read file as Data URL
  const dataUrl = await fileToDataUrl(file);
  return {
    url: dataUrl,
    source: 'local_fallback',
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
