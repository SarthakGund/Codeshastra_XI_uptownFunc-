import RegexBuilder from '@/components/tools/RegexBuilder';

export const metadata = {
  title: 'Regex Pattern Builder | DevUtilities',
  description: 'Create regular expression patterns easily with AI assistance',
};

export default function RegexBuilderPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Regex Pattern Builder</h1>
      <p className="text-gray-600 mb-8">
        Build regular expressions by combining fixed text and variable patterns.
        Our AI will optimize your regex pattern and explain how it works.
      </p>
      
      <RegexBuilder />
    </div>
  );
}