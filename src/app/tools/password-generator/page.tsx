'use client';

import PasswordGenerator from '@/components/tools/PasswordGenerator';
import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';


export default function PasswordGeneratorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Password Generator</h1>
        <ToolUsageWrapper toolName="password-generator">
            <PasswordGenerator />
        </ToolUsageWrapper>
    </div>
  );
}