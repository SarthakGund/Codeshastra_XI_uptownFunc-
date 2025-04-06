import UnitConverter from '@/components/tools/UnitConverter';

export const metadata = {
  title: 'Unit Converter | DevUtilities',
  description: 'Convert between different units of measurement',
};

export default function UnitConverterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Unit Converter</h1>
      <p className="text-gray-600 mb-8">
        Easily convert between different units of measurement including length, weight, temperature, and currency.
      </p>
      
      <UnitConverter />
    </div>
  );
}