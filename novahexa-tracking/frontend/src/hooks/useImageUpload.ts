import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { uploadPhoto } from '../lib/api';

/**
 * Reusable hook for multi-image upload to Cloudinary.
 * Manages file selection, upload, previews, blob URLs, and cleanup.
 */
export function useImageUpload() {
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string[]>([]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const preview = URL.createObjectURL(file);
      blobRef.current.push(preview);
      setPreviews((prev) => [...prev, preview]);
      try {
        const url = await uploadPhoto(file);
        setImages((prev) => [...prev, url]);
      } catch { /* skip failed uploads */ }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const remove = (index: number) => {
    URL.revokeObjectURL(blobRef.current[index]);
    blobRef.current.splice(index, 1);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    blobRef.current.forEach(URL.revokeObjectURL);
    blobRef.current = [];
    setImages([]);
    setPreviews([]);
  };

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => { blobRef.current.forEach((src) => URL.revokeObjectURL(src)); };
  }, []);

  return { images, previews, uploading, fileRef, handleUpload, remove, reset };
}
