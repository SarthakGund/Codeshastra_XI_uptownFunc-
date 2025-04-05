'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabProps[] = [
  {
    id: 'qrcode',
    label: 'QR Code Generator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-qr-code">
        <rect width="5" height="5" x="3" y="3" rx="1" />
        <rect width="5" height="5" x="16" y="3" rx="1" />
        <rect width="5" height="5" x="3" y="16" rx="1" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
        <path d="M21 21v.01" />
        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
        <path d="M3 12h.01" />
        <path d="M12 3h.01" />
        <path d="M12 16v.01" />
        <path d="M16 12h1" />
        <path d="M21 12v.01" />
        <path d="M12 21v-1" />
      </svg>
    ),
  },
  {
    id: 'barcode',
    label: 'Barcode Generator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-barcode">
        <path d="M3 5v14" />
        <path d="M8 5v14" />
        <path d="M12 5v14" />
        <path d="M17 5v14" />
        <path d="M21 5v14" />
      </svg>
    ),
  },
  {
    id: 'convert',
    label: 'Image Converter',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
];

const IMAGE_FORMATS = ['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP', 'PDF'];

export default function ImageGenerator() {
  const [activeTab, setActiveTab] = useState<string>('qrcode');
  const [qrText, setQrText] = useState<string>('');
  const [barcodeText, setBarcodeText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertFormat, setConvertFormat] = useState<string>('PNG');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQRCode = async () => {
    if (!qrText.trim()) {
      setError('Please enter some text for the QR code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQrImage(null);

    try {
      const response = await fetch('http://localhost:5050/api/generate-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: qrText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      setQrImage(data.qr_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBarcode = async () => {
    if (!barcodeText.trim()) {
      setError('Please enter some text for the barcode');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBarcodeImage(null);

    try {
      const response = await fetch('http://localhost:5050/api/generate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: barcodeText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate barcode');
      }

      setBarcodeImage(data.barcode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const convertImage = async () => {
    if (!selectedFile) {
      setError('Please select an image to convert');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConvertedImage(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('format', convertFormat);

      const response = await fetch('http://localhost:5050/api/convert-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert image');
      }

      setConvertedImage(data.converted_image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset state when switching tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setError(null);
    
    // Reset specific tab data
    if (tabId === 'qrcode') {
      setQrImage(null);
    } else if (tabId === 'barcode') {
      setBarcodeImage(null);
    } else if (tabId === 'convert') {
      setConvertedImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Generator */}
        {activeTab === 'qrcode' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 mb-1">
                Text or URL for QR Code
              </label>
              <textarea
                id="qr-text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter text or URL for QR code"
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={generateQRCode}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                'Generate QR Code'
              )}
            </button>

            {qrImage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Generated QR Code</h3>
                  <button
                    onClick={() => downloadImage(qrImage, 'qrcode.png')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Download
                  </button>
                </div>
                <div className="flex justify-center">
                  <img src={qrImage} alt="QR Code" className="max-w-full h-auto max-h-64" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Barcode Generator */}
        {activeTab === 'barcode' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="barcode-text" className="block text-sm font-medium text-gray-700 mb-1">
                Text for Barcode
              </label>
              <input
                id="barcode-text"
                type="text"
                value={barcodeText}
                onChange={(e) => setBarcodeText(e.target.value)}
                placeholder="Enter text for barcode"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                For best results, use numbers or alphanumeric text
              </p>
            </div>

            <button
              onClick={generateBarcode}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                'Generate Barcode'
              )}
            </button>

            {barcodeImage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Generated Barcode</h3>
                  <button
                    onClick={() => downloadImage(barcodeImage, 'barcode.png')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Download
                  </button>
                </div>
                <div className="flex justify-center">
                  <img src={barcodeImage} alt="Barcode" className="max-w-full h-auto max-h-32" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Converter */}
        {activeTab === 'convert' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image to Convert
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
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
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, BMP, TIFF, WEBP up to 10MB</p>
                </div>
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
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
              onClick={convertImage}
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
              ) : (
                `Convert to ${convertFormat}`
              )}
            </button>

            {convertedImage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Converted Image ({convertFormat})
                  </h3>
                  <button
                    onClick={() => downloadImage(convertedImage, `converted.${convertFormat.toLowerCase()}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Download
                  </button>
                </div>
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
                      <p className="text-xs text-gray-500 mt-1">Click download to save</p>
                    </div>
                  ) : (
                    <img src={convertedImage} alt="Converted" className="max-w-full h-auto max-h-64" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}