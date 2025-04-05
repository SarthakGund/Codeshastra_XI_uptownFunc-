'use client';

import { useState, useEffect } from 'react';
import ClientOnly from '../ClientOnly';

interface Base64ImageProps {
  base64Data: string;
  alt: string;
  className?: string;
  showDownload?: boolean;
  downloadFileName?: string;
  imageFormat?: string;
}

export default function Base64Image({
  base64Data,
  alt,
  className = "max-w-full h-auto",
  showDownload = false,
  downloadFileName = "image",
  imageFormat = "png"
}: Base64ImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Handle base64 data with or without data URI prefix
      if (!base64Data) {
        setImageSrc('');
        return;
      }
      
      setImageSrc(
        base64Data.startsWith('data:') 
          ? base64Data 
          : `data:image/${imageFormat};base64,${base64Data}`
      );
    } catch (err) {
      setError('Failed to process image data');
      console.error('Error processing base64 image:', err);
    }
  }, [base64Data, imageFormat]);

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `${downloadFileName}.${imageFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download image');
      console.error('Error downloading image:', err);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md border border-red-200">
        Error: {error}
      </div>
    );
  }

  if (!imageSrc) {
    return null;
  }

  return (
    <ClientOnly>
      <div className="flex flex-col items-center">
        <img 
          src={imageSrc} 
          alt={alt} 
          className={className} 
        />
        
        {showDownload && (
          <button
            onClick={handleDownload}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download
          </button>
        )}
      </div>
    </ClientOnly>
  );
}