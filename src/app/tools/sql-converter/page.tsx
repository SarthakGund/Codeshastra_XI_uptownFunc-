import SqlConverter from '@/components/tools/SqlConverter';

export default function SqlConverterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">SQL Converter</h1>
      <p className="text-gray-300 mb-6">
        A set of tools for working with SQL: convert between dialects, generate mock data from schemas, and convert SQL to JSON schema.
      </p>
      <SqlConverter />
    </div>
  );
}