'use client';

import ImageGeneratorTool from '@/components/tools/ImageGeneratorTool';

export default function ImageToolsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Image Tools</h1>
      <ImageGeneratorTool />
    </div>
  );
}