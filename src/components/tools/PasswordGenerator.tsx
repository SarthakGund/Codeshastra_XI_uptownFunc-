import { useState } from 'react';
import { randomApi } from '@/utils/api';

interface PasswordResult {
  password: string;
  entropy: number;
  strength: string;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(12);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await randomApi.generatePassword({
        length,
        symbols: useSymbols,
        numbers: useNumbers
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-black rounded shadow">
      {/* <h2 className="text-xl font-bold mb-4">Password Generator</h2> */}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="length" className="block mb-1">Password Length: {length}</label>
          <input
            type="range"
            id="length"
            min={6}
            max={32}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={() => setUseSymbols(!useSymbols)}
              className="mr-2"
            />
            Include Symbols
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={() => setUseNumbers(!useNumbers)}
              className="mr-2"
            />
            Include Numbers
          </label>
        </div>
        
        <button
          onClick={generatePassword}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Password'}
        </button>
        
        {error && (
          <div className="text-red-500 mt-2">{error}</div>
        )}
        
        {result && (
          <div className="mt-4 p-3 border rounded">
            <div className="mb-2">
              <span className="font-semibold">Password:</span>
              <div className="p-2 bg-gray-900 font-mono break-all">{result.password}</div>
            </div>
            <div>
              <span className="font-semibold">Strength:</span>{' '}
              <span className={`font-bold ${
                result.strength === 'Strong' ? 'text-green-600' :
                result.strength === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.strength}
              </span>
              {' '}(Entropy: {result.entropy.toFixed(2)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}