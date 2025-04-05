'use client';

import { useState } from 'react';
import { generateBarcode } from '@/utils/imageApi';
import Base64Image from '@/components/common/Base64Image';
import ClientOnly from '@/components/ClientOnly';

export default function BarcodeGenerator() {
  const [text, setText] = useState('');
  const [barcodeBase64, setBarcodeBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text for the barcode');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBarcodeBase64(null);

    try {
      const base64Data = await generateBarcode({ text });
      setBarcodeBase64(base64Data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate barcode');
      console.error('Barcode generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="barcode-text" className="block text-sm font-medium text-gray-700 mb-1">
          Text for Barcode
        </label>
        <input
          id="barcode-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text for barcode"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          For best results, use numbers or alphanumeric text
        </p>
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
        ) : 'Generate Barcode'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
          {error}
        </div>
      )}

      <ClientOnly>
        {barcodeBase64 && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-4 text-center">Generated Barcode</h3>
            <div className="flex justify-center">
              <Base64Image
                base64Data={barcodeBase64}
                alt="Barcode"
                className="max-w-full h-auto max-h-32"
                showDownload
                downloadFileName="barcode"
              />
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}