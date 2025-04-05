'use client';

import { useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import BarcodeGenerator from './BarcodeGenerator';
import ImageConverter from './ImageConverter';
import ClientOnly from '@/components/ClientOnly';

type TabType = 'qrcode' | 'barcode' | 'converter';

export default function ImageGeneratorTool() {
  const [activeTab, setActiveTab] = useState<TabType>('qrcode');

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('qrcode')}
          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'qrcode'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          QR Code Generator
        </button>
        
        <button
          onClick={() => setActiveTab('barcode')}
          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'barcode'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5v14" />
            <path d="M8 5v14" />
            <path d="M12 5v14" />
            <path d="M17 5v14" />
            <path d="M21 5v14" />
          </svg>
          Barcode Generator
        </button>
        
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'converter'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          Image Converter
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <ClientOnly>
          {activeTab === 'qrcode' && <QRCodeGenerator />}
          {activeTab === 'barcode' && <BarcodeGenerator />}
          {activeTab === 'converter' && <ImageConverter />}
        </ClientOnly>
      </div>
    </div>
  );
}