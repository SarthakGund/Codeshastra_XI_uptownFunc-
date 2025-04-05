'use client';

import NetworkTools from '@/components/tools/NetworkTools';

export default function NetworkToolsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Network Tools</h1>
      <NetworkTools />
    </div>
  );
}