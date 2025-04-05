'use client';

import CodeFormatter from '@/components/tools/CodeFormatter';

export default function CodeFormatterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* <h1 className="text-3xl font-bold mb-6">Code Formatter & Validator</h1> */}
      <CodeFormatter />
    </div>
  );
}