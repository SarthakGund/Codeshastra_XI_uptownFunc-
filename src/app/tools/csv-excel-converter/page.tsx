'use client';

import CsvExcelConverter from '@/components/tools/CsvExcelConverter';

export default function CsvExcelConverterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">CSV & Excel Converter</h1>
      <CsvExcelConverter />
    </div>
  );
}