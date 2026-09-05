import React, { useRef, useState } from 'react';
import { Camera, Check, RefreshCw } from 'lucide-react';
import { usePuoImage } from '../utils/puoStore';

interface PuoAvatarWithUploadProps {
  sizeClass?: string;
  className?: string;
  alt?: string;
}

export const PuoAvatarWithUpload: React.FC<PuoAvatarWithUploadProps> = ({
  sizeClass = 'w-32 h-32',
  className = '',
  alt = 'Professor Under Officer (PUO)',
}) => {
  const { imageSrc, updatePhoto, resetToDefault, isCustom } = usePuoImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jfif|jpg|jpeg|png|webp)$/i)) {
      setErrorMsg('Please select a valid image file (.jfif, .jpg, .png)');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    try {
      await updatePhoto(file);
      setShowSuccessToast(true);
      setErrorMsg(null);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch {
      setErrorMsg('Failed to process image');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChange}
        accept="image/*,.jfif"
        className="hidden"
        id="puo-file-input"
      />

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`${sizeClass} rounded-full overflow-hidden border-2 border-[#cdc6b3] dark:border-[#464237] shadow-sm relative cursor-pointer group transition-all duration-300 ${
          isDragOver ? 'ring-4 ring-[#6b5e10] dark:ring-[#eedc82] scale-105' : 'hover:border-[#6b5e10] dark:hover:border-[#eedc82]'
        }`}
        title="Click or drag and drop to upload PUO photo (.jfif, .jpg, .png)"
      >
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Hover / Drag Overlay */}
        <div
          className={`absolute inset-0 bg-[#1c1c18]/70 flex flex-col items-center justify-center text-center p-2 text-white transition-opacity duration-200 ${
            isHovered || isDragOver ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Camera className="w-5 h-5 text-[#eedc82] mb-1" />
          <span className="text-[10px] font-semibold tracking-tight leading-tight">
            {isDragOver ? 'Drop to Upload' : 'Upload / Replace'}
          </span>
          <span className="text-[8px] text-[#cdc6b3] opacity-80 mt-0.5">
            JPG, JFIF, PNG
          </span>
        </div>
      </div>

      {/* Quick feedback toast */}
      {showSuccessToast && (
        <div className="absolute -bottom-8 bg-[#1c1c18] text-[#eedc82] text-[11px] font-medium py-1 px-3 rounded-full shadow-md flex items-center gap-1.5 z-20 whitespace-nowrap animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>PUO photo updated!</span>
        </div>
      )}

      {errorMsg && (
        <div className="absolute -bottom-8 bg-rose-900 text-rose-100 text-[11px] font-medium py-1 px-3 rounded-full shadow-md z-20 whitespace-nowrap">
          {errorMsg}
        </div>
      )}

      {/* Reset button if custom image is active */}
      {isCustom && !showSuccessToast && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetToDefault();
          }}
          className="mt-2 text-[10px] text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] flex items-center gap-1 transition-colors"
          title="Reset to default placeholder image"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          Reset to default
        </button>
      )}
    </div>
  );
};
