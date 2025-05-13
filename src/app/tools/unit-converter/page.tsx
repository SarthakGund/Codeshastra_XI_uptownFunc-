'use client';

import UnitConverter from '@/components/tools/UnitConverter';
import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';

export default function UnitConverterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Unit Converter</h1>
      <p className="text-gray-600 mb-8">
        Easily convert between different units of measurement including length, weight, temperature, and currency.
      </p>
      
      <ToolUsageWrapper toolName="unit-converter">
        <UnitConverter />
      </ToolUsageWrapper>
    </div>
  );
}