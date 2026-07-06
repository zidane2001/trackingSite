import { useState, useEffect, useCallback } from 'react';
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
  imageUrls: string[];
  title?: string;
  columns?: 2 | 3;
  imageHeight?: string;
  className?: string;
}

export function PhotoGallery({
  imageUrls,
  title = 'Photos du colis',
  columns = 3,
  imageHeight = 'h-24',
  className = '',
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : imageUrls.length - 1));
  }, [imageUrls.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i < imageUrls.length - 1 ? i + 1 : 0));
  }, [imageUrls.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, close, prev, next]);

  if (!imageUrls || imageUrls.length === 0) return null;

  const gridCols = columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';

  return (
    <>
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-400" /> {title}
        </h3>
        <div className={`grid ${gridCols} gap-2`}>
          {imageUrls.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="focus:outline-none"
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className={`w-full ${imageHeight} object-cover rounded-lg border border-slate-200 hover:border-yellow-400 transition cursor-pointer`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center backdrop-blur-sm"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-[10001] w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          {imageUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 z-[10001] w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Image */}
          <img
            src={imageUrls[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {imageUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 z-[10001] w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Counter */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-sm font-medium">
              {lightboxIndex + 1} / {imageUrls.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
