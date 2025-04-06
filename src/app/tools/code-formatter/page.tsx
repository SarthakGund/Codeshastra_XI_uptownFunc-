'use client';

import CodeFormatter from '@/components/tools/CodeFormatter';
import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';


export default function CodeFormatterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* <h1 className="text-3xl font-bold mb-6">Code Formatter & Validator</h1> */}
      <ToolUsageWrapper toolName="code-formatter">
        <CodeFormatter />
      </ToolUsageWrapper>      
    </div>
  );
}