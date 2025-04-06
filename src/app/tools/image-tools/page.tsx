'use client';

import ImageGeneratorTool from '@/components/tools/ImageGeneratorTool';
import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';


export default function ImageToolsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Image Tools</h1>
              <ToolUsageWrapper toolName="image-tools">
      <ImageGeneratorTool />
              </ToolUsageWrapper>
    </div>
  );
}