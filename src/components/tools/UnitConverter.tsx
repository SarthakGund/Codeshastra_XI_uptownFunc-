'use client';

import { useState, useEffect } from 'react';
import { IconArrowRight, IconSwitch, IconLoader2 } from '@tabler/icons-react';

type ConversionType = 'length' | 'weight' | 'temperature' | 'currency';

interface ConversionOption {
  value: string;
  label: string;
  symbol?: string;
}

interface ConversionResponse {
  source: {
    value: number;
    unit: string;
  };
  target: {
    value: number;
    unit: string;
  };
}

const UnitConverter = () => {
  // State management
  const [activeTab, setActiveTab] = useState<ConversionType>('length');
  const [value, setValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Unit options for different conversion types
  const unitOptions: Record<ConversionType, ConversionOption[]> = {
    length: [
      { value: 'm', label: 'Meters', symbol: 'm' },
      { value: 'feet', label: 'Feet', symbol: 'ft' },
      { value: 'cm', label: 'Centimeters', symbol: 'cm' },
      { value: 'in', label: 'Inches', symbol: 'in' },
      { value: 'km', label: 'Kilometers', symbol: 'km' },
      { value: 'mi', label: 'Miles', symbol: 'mi' },
    ],
    weight: [
      { value: 'kg', label: 'Kilograms', symbol: 'kg' },
      { value: 'lbs', label: 'Pounds', symbol: 'lbs' },
      { value: 'g', label: 'Grams', symbol: 'g' },
      { value: 'oz', label: 'Ounces', symbol: 'oz' },
      { value: 't', label: 'Tons', symbol: 't' },
    ],
    temperature: [
      { value: 'c', label: 'Celsius', symbol: '°C' },
      { value: 'f', label: 'Fahrenheit', symbol: '°F' },
      { value: 'k', label: 'Kelvin', symbol: 'K' },
    ],
    currency: [
      { value: 'USD', label: 'US Dollar', symbol: '$' },
      { value: 'EUR', label: 'Euro', symbol: '€' },
      { value: 'GBP', label: 'British Pound', symbol: '£' },
      { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
      { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    ],
  };
  
  // Set default units when tab changes
  useEffect(() => {
    const options = unitOptions[activeTab];
    if (options.length >= 2) {
      setFromUnit(options[0].value);
      setToUnit(options[1].value);
      setResult(null);
      setValue('1');
    }
  }, [activeTab]);

  // Swap units
  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    // Convert again with swapped units
    if (value) {
      handleConvert();
    }
  };

  // Find unit label/symbol
  const getUnitInfo = (unitValue: string) => {
    const unit = unitOptions[activeTab].find(u => u.value === unitValue);
    return {
      label: unit?.label || unitValue,
      symbol: unit?.symbol || unitValue
    };
  };

  // Handle conversion
  const handleConvert = async () => {
    if (!value || isNaN(Number(value)) || !fromUnit || !toUnit) {
      setError('Please enter a valid value and select units');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construct URL with query parameters
      const url = new URL(`http://localhost:5050/api/convert/${activeTab}`);
      url.searchParams.append('value', value);
      url.searchParams.append('from', fromUnit);
      url.searchParams.append('to', toUnit);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const data: ConversionResponse = await response.json();
      setResult(data.target.value);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during connection. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Format result based on conversion type
  const formatResult = () => {
    if (result === null) return '';
    
    // Get the target unit symbol
    const { symbol } = getUnitInfo(toUnit);
    
    // Format differently based on conversion type
    if (activeTab === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: toUnit,
        maximumFractionDigits: 2
      }).format(result);
    }
    
    return `${result.toFixed(2)} ${symbol}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Custom Tabs implementation */}
      <div className="w-full">
        <div className="flex space-x-1 rounded-lg p-1 bg-gray-800 mb-6">
          {(['length', 'weight', 'temperature', 'currency'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-gray-700 text-gray-100 shadow' 
                  : 'text-gray-400 hover:text-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Card component */}
        <div className="rounded-lg bg-gray-900 border border-gray-700 shadow-sm">
          <div className="p-6">
            {/* From section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">From</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200"
                    placeholder="Enter value"
                  />
                </div>
                <div className="flex-1">
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200"
                  >
                    {unitOptions[activeTab].map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center my-4">
              <button 
                onClick={swapUnits}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300"
                aria-label="Swap units"
              >
                <IconSwitch className="h-5 w-5" />
              </button>
            </div>

            {/* To section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">To</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-gray-200">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <IconLoader2 className="h-5 w-5 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      formatResult() || '-'
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200"
                  >
                    {unitOptions[activeTab].map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Convert button */}
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <IconArrowRight className="h-5 w-5" />
                  Convert
                </>
              )}
            </button>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border-l-4 border-red-500 text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;