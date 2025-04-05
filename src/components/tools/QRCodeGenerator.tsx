'use client';

import { useState } from 'react';
import { generateQRCode } from '@/utils/imageApi';
import Base64Image from '@/components/common/Base64Image';
import ClientOnly from '@/components/ClientOnly';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text or URL for the QR code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQrCodeBase64(null);

    try {
      const base64Data = await generateQRCode({ text });
      setQrCodeBase64(base64Data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      console.error('QR code generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 mb-1">
          Text or URL for QR Code
        </label>
        <textarea
          id="qr-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL for QR code"
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleGenerate}
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
        ) : 'Generate QR Code'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
          {error}
        </div>
      )}

      <ClientOnly>
        {qrCodeBase64 && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-4 text-center">Generated QR Code</h3>
            <div className="flex justify-center">
              <Base64Image
                base64Data={qrCodeBase64}
                alt="QR Code" 
                className="max-w-full h-auto max-h-64"
                showDownload
                downloadFileName="qr-code"
              />
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}