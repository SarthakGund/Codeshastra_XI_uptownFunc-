'use client';

import OCRTool from '@/components/tools/OCRConverter';
import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';

// export const metadata = {
//   title: 'OCR Text Extractor | DevUtilities',
//   description: 'Extract text from images and convert to PDF or DOCX documents',
// };

export default function OCRPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">OCR Text Extractor</h1>
      <p className="text-gray-600 mb-8">
        Extract text from images using Optical Character Recognition technology.
      </p>
      
      <ToolUsageWrapper toolName="ocr">
        <OCRTool />
      </ToolUsageWrapper>
    </div>
  );
}