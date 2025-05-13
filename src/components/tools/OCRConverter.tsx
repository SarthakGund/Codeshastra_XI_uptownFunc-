'use client';

import { useState, useRef } from 'react';
import { IconFileText, IconFile, IconUpload } from '@tabler/icons-react';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL + '/api';

export default function OCRConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setExtractedText(null);
    setPdfUrl(null);
    setDocxUrl(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setExtractedText(null);
    setPdfUrl(null);
    setDocxUrl(null);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processImage = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_ENDPOINT}/ocr/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
      });

      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('CORS error or network failure - check server configuration');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const data = await response.json();
      setExtractedText(data.text);
      setPdfUrl(`${API_ENDPOINT}${data.pdf_url}`);
      setDocxUrl(`${API_ENDPOINT}${data.docx_url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setExtractedText(null);
    setPdfUrl(null);
    setDocxUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Image for OCR
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors"
        >
          <div className="space-y-1 text-center">
            <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-black rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
              >
                <span>Upload an image</span>
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
            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <button
              onClick={resetForm}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          </div>
          
          {selectedFile.type.startsWith('image/') && (
            <div className="mt-2 p-2 bg-gray-900 rounded flex justify-center">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected image preview"
                className="max-h-64 max-w-full object-contain"
                onLoad={() => URL.revokeObjectURL(URL.createObjectURL(selectedFile))}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={processImage}
        disabled={isLoading || !selectedFile}
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Extract Text from Image'}
      </button>

      {extractedText && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Extracted Text</h3>
          <div className="bg-gray-900 p-4 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href={pdfUrl || '#'}
              download
              className={`${
                pdfUrl ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'
              } flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              disabled={!pdfUrl}
            >
              <IconFile className="mr-2 h-5 w-5" />
              Download as PDF
            </a>
            
            <a
              href={docxUrl || '#'}
              download
              className={`${
                docxUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
              } flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={!docxUrl}
            >
              <IconFileText className="mr-2 h-5 w-5" />
              Download as DOCX
            </a>
          </div>
        </div>
      )}
    </div>
  );
}