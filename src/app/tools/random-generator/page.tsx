import { ToolUsageWrapper } from '@/components/ToolUsageWrapper';
import RandomGenerator from '@/components/tools/RandomGenerator';

export default function RandomGeneratorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Random Generator</h1>
      
      <ToolUsageWrapper toolName="random-generator">
        <RandomGenerator />
      </ToolUsageWrapper>
    </div>
  );
}