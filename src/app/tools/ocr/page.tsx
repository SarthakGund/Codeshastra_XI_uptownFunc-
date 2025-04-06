import OCRConverter from '@/components/tools/OCRConverter';

export const metadata = {
  title: 'OCR Text Extractor | DevUtilities',
  description: 'Extract text from images and convert to PDF or DOCX documents',
};

export default function OCRPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">OCR Text Extractor</h1>
      <p className="text-gray-600 mb-8">
        Extract text from images using Optical Character Recognition technology.
        Upload an image to extract text content and download as PDF or Word documents.
      </p>
      
      <OCRConverter />
    </div>
  );
}