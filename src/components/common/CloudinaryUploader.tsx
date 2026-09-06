// src/components/common/CloudinaryUploader.tsx
import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, X, Cloud } from 'lucide-react';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

interface CloudinaryUploaderProps {
  value?: string;
  currentImageUrl?: string;
  onChange?: (url: string) => void;
  onUploadComplete?: (url: string) => void;
  folder?: string;
  label?: string;
  helperText?: string;
  helpText?: string;
  aspectRatio?: 'square' | 'banner' | 'auto';
  className?: string;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  value,
  currentImageUrl,
  onChange,
  onUploadComplete,
  folder = 'ngdc_bncc',
  label = 'Upload Image',
  helperText,
  helpText,
  aspectRatio = 'square',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = value || currentImageUrl || '';
  const effectiveHelperText = helperText || helpText;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatusMessage({ type: 'error', text: 'Invalid file type. Only JPG, PNG, WebP allowed.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'File size exceeds 10MB limit.' });
      return;
    }
    setIsUploading(true);
    setStatusMessage({ type: 'info', text: 'Uploading to Cloudinary...' });
    try {
      const url = await uploadImageToCloudinary(file, folder);
      setStatusMessage({ type: 'success', text: 'Uploaded to Cloudinary CDN!' });
      if (typeof onChange === 'function') onChange(url);
      if (typeof onUploadComplete === 'function') onUploadComplete(url);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Upload failed: Cloudinary configuration missing.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] text-xs">
            {label}
          </label>
          <span className="text-[10px] flex items-center gap-1 font-mono text-[#7c7767] dark:text-[#aca596]">
            <Cloud className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
            'Cloudinary CDN Active'
          </span>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#eedc82] bg-[#eedc82]/20 dark:bg-[#eedc82]/10 scale-[0.99]'
            : 'border-[#cdc6b3] dark:border-[#423e35] bg-[#f6f3ed]/60 dark:bg-[#1a1915]/60 hover:bg-[#f6f3ed] dark:hover:bg-[#1a1915] hover:border-[#eedc82]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {displayImage ? (
          <div className="space-y-3">
            <div className="relative mx-auto inline-block group">
              <img
                src={displayImage}
                alt="Upload preview"
                referrerPolicy="no-referrer"
                className={`mx-auto rounded-xl object-cover border border-[#cdc6b3] dark:border-[#423e35] shadow-xs ${
                  aspectRatio === 'banner'
                    ? 'w-full max-h-36 object-contain bg-white dark:bg-black/20'
                    : 'w-24 h-24 object-cover'
                }`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onChange === 'function') onChange('');
                  if (typeof onUploadComplete === 'function') onUploadComplete('');
                }}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#695c4e] dark:text-[#aca596] font-medium">
              Click or drag another image to replace
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-[#eedc82]/30 dark:bg-[#eedc82]/15 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                {isUploading ? 'Uploading to Cloudinary...' : 'Click or Drag & Drop Image'}
              </p>
              <p className="text-[10px] text-[#7c7767] dark:text-[#aca586] mt-0.5">
                Supports JPG, PNG, WebP up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {effectiveHelperText && (
        <p className="text-[10px] text-[#7c7767] dark:text-[#aca596]">{effectiveHelperText}</p>
      )}
    </div>
  );
};
