'use client';

import { useState, useRef } from 'react';
import { convertImage } from '@/utils/imageApi';
import Base64Image from '@/components/common/Base64Image';
import ClientOnly from '@/components/ClientOnly';

const IMAGE_FORMATS = ['PNG', 'JPEG', 'GIF', 'BMP', 'TIFF', 'WEBP', 'PDF'];

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertFormat, setConvertFormat] = useState('PNG');
  const [convertedBase64, setConvertedBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setConvertedBase64(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setConvertedBase64(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select an image file to convert');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConvertedBase64(null);

    try {
      const base64Data = await convertImage({
        image: selectedFile,
        format: convertFormat
      });
      
      setConvertedBase64(base64Data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert image');
      console.error('Image conversion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedBase64(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Image to Convert
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors"
        >
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF, BMP, TIFF, WEBP up to 10MB</p>
          </div>
        </div>
        
        {selectedFile && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
              <button 
                onClick={resetForm}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
            
            {previewUrl && (
              <div className="mt-2 p-2 bg-gray-50 rounded flex justify-center">
                <img 
                  src={previewUrl} 
                  alt="Selected file preview" 
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
          Convert To
        </label>
        <select
          id="format"
          value={convertFormat}
          onChange={(e) => setConvertFormat(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {IMAGE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleConvert}
        disabled={isLoading || !selectedFile}
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Converting...
          </div>
        ) : `Convert to ${convertFormat}`}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
          {error}
        </div>
      )}

      <ClientOnly>
        {convertedBase64 && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-4 text-center">
              Converted Image ({convertFormat})
            </h3>
            <div className="flex justify-center">
              {convertFormat === 'PDF' ? (
                <div className="bg-gray-200 p-6 rounded flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 mb-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  <p className="text-sm text-gray-700">PDF Created Successfully</p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:application/pdf;base64,${convertedBase64}`;
                      link.download = 'converted.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                </div>
              ) : (
                <Base64Image
                  base64Data={convertedBase64}
                  alt="Converted Image"
                  className="max-w-full h-auto max-h-64"
                  showDownload
                  downloadFileName={`converted-image.${convertFormat.toLowerCase()}`}
                  imageFormat={convertFormat.toLowerCase()}
                />
              )}
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}