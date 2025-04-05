'use client';

import { useState } from 'react';
import { randomApi } from '@/utils/api';

interface RandomResult {
  random_number: number;
  uuid1: string;
  uuid2: string;
}

export default function RandomGenerator() {
  const [start, setStart] = useState<number>(1);
  const [end, setEnd] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RandomResult | null>(null);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setStart(isNaN(value) ? 0 : value);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setEnd(isNaN(value) ? 0 : value);
  };

  const generateRandom = async () => {
    // Validate input
    if (start > end) {
      setError('Start value must be less than or equal to end value');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await randomApi.generateRandomNumber({
        start,
        end
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-black rounded-lg shadow-md p-6">
      {/* <h2 className="text-2xl font-bold text-gray-100 mb-6">Random Generator</h2> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Number Generator Section */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Random Number</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Range
                </label>
                <input
                  type="number"
                  id="start"
                  value={start}
                  onChange={handleStartChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-300 mb-1">
                  End Range
                </label>
                <input
                  type="number"
                  id="end"
                  value={end}
                  onChange={handleEndChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
            
            <button
              onClick={generateRandom}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Random Values'}
            </button>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Results</h3>
          
          {error ? (
            <div className="p-3 bg-red-900/50 border-l-4 border-red-500 rounded-md">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Random Number:</span>
                  <button 
                    onClick={() => copyToClipboard(result.random_number.toString())}
                    className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-1 p-2 bg-gray-700 rounded font-mono text-gray-100">
                  {result.random_number}
                </div>
              </div>
              
              <div className="group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">UUID v1:</span>
                  <button 
                    onClick={() => copyToClipboard(result.uuid1)}
                    className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-1 p-2 bg-gray-700 rounded font-mono text-sm text-gray-100 break-all">
                  {result.uuid1}
                </div>
              </div>
              
              <div className="group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">UUID v4:</span>
                  <button 
                    onClick={() => copyToClipboard(result.uuid2)}
                    className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-1 p-2 bg-gray-700 rounded font-mono text-sm text-gray-100 break-all">
                  {result.uuid2}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>Random values will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-900 p-4 rounded-md">
        <h3 className="font-medium text-gray-200 mb-2">How to use:</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
          <li>Set the range for random number generation</li>
          <li>Click the "Generate" button to create values</li>
          <li>The results will show a random number and two UUIDs</li>
          <li>Hover over any result and click "Copy" to copy to clipboard</li>
        </ol>
      </div>
    </div>
  );
}