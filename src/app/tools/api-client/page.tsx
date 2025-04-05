'use client';

import ApiClient from '@/components/tools/ApiClient';

export default function ApiClientPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">REST API Client</h1>
      <ApiClient />
    </div>
  );
}