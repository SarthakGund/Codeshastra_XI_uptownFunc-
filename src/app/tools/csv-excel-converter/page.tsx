'use client';

import CsvExcelConverter from '@/components/tools/CsvExcelConverter';
import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';


export default function CsvExcelConverterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">CSV & Excel Converter</h1>
              <ToolUsageWrapper toolName="csv-excel-converter">
      <CsvExcelConverter />
              </ToolUsageWrapper>
    </div>
  );
}