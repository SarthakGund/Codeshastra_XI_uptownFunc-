'use client';

import { useState, useEffect } from 'react';
import { IconPlus, IconTrash, IconCheck, IconX, IconRefresh, IconCopy } from '@tabler/icons-react';
import { RegexResult } from './types';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL+ '/api';

type CharacterSet = 'digits' | 'letters' | 'lowercase' | 'uppercase' | 'alphanumeric' | 'symbols' | 'any' | 'custom';

interface LengthOption {
  exact?: number;
  min?: number;
  max?: number;
}

interface RegexBlock {
  id: string;
  type: 'fixed' | 'variable';
  value?: string;
  characterSet?: CharacterSet;
  customCharacters?: string;
  length?: LengthOption;
}

// Update CharacterSelector component with dark theme
function CharacterSelector({ 
  selectedChars, 
  onChange 
}: { 
  selectedChars: string, 
  onChange: (chars: string) => void 
}) {
  const charGroups = [
    { name: 'Digits', chars: '0123456789' },
    { name: 'Lowercase', chars: 'abcdefghijklmnopqrstuvwxyz' },
    { name: 'Uppercase', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { name: 'Common Symbols', chars: '!@#$%^&*()_+-=[]{}|;:,.<>/?~' },
  ];

  // Toggle functions remain unchanged
  const toggleChar = (char: string) => {
    if (selectedChars.includes(char)) {
      onChange(selectedChars.replace(char, ''));
    } else {
      onChange(selectedChars + char);
    }
  };

  const toggleGroup = (chars: string) => {
    // Existing code - functionality unchanged
    let newSelection = selectedChars;
    let allSelected = true;
    
    for (const char of chars) {
      if (!selectedChars.includes(char)) {
        allSelected = false;
        break;
      }
    }
    
    if (allSelected) {
      for (const char of chars) {
        newSelection = newSelection.replace(char, '');
      }
    } else {
      for (const char of chars) {
        if (!newSelection.includes(char)) {
          newSelection += char;
        }
      }
    }
    
    onChange(newSelection);
  };

  const [customInput, setCustomInput] = useState('');
  const addCustomChars = () => {
    // Existing code - functionality unchanged
    if (!customInput) return;
    
    let newChars = '';
    for (const char of customInput) {
      if (!selectedChars.includes(char)) {
        newChars += char;
      }
    }
    
    onChange(selectedChars + newChars);
    setCustomInput('');
  };

  return (
    <div className="space-y-4">
      {/* Custom character input - Dark themed */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add custom characters..."
          className="flex-1 px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addCustomChars}
          disabled={!customInput}
          className="px-3 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Quick toggle groups - Dark themed */}
      <div className="flex flex-wrap gap-2">
        {charGroups.map(group => (
          <button
            key={group.name}
            onClick={() => toggleGroup(group.chars)}
            className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 text-gray-200"
          >
            {group.name}
          </button>
        ))}
      </div>
      
      {/* Selected characters preview - Dark themed */}
      <div className="mt-2">
        <div className="text-sm font-medium text-gray-300 mb-1">
          Selected Characters ({selectedChars.length})
        </div>
        <div className="p-3 bg-gray-800 rounded-md border border-gray-600 min-h-[40px] max-h-[80px] overflow-y-auto break-all text-gray-200">
          {selectedChars || <span className="text-gray-500">No characters selected</span>}
        </div>
      </div>

      {/* Character grid for selection - Dark themed */}
      <div className="space-y-3">
        {charGroups.map(group => (
          <div key={group.name}>
            <div className="text-sm font-medium text-gray-300 mb-1">{group.name}</div>
            <div className="flex flex-wrap gap-1">
              {group.chars.split('').map(char => (
                <button
                  key={char}
                  onClick={() => toggleChar(char)}
                  className={`w-8 h-8 flex items-center justify-center border rounded 
                    ${selectedChars.includes(char) 
                      ? 'bg-blue-600 text-white border-blue-700' 
                      : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'}`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegexBuilder() {
  const [blocks, setBlocks] = useState<RegexBlock[]>([
    { id: '1', type: 'fixed', value: '' }
  ]);
  const [result, setResult] = useState<RegexResult | null>(null);
  const [testString, setTestString] = useState('');
  const [testResult, setTestResult] = useState<{ isMatch: boolean; groups?: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper to generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Add a new block
  const addBlock = (type: 'fixed' | 'variable') => {
    const newBlock: RegexBlock = { 
      id: generateId(),
      type 
    };
    
    if (type === 'fixed') {
      newBlock.value = '';
    } else {
      newBlock.characterSet = 'alphanumeric';
      newBlock.length = { min: 1, max: 10 };
    }
    
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) return; // Don't remove the last block
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<RegexBlock>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const generatePattern = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      const response = await fetch(`${API_ENDPOINT}/regex-builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('CORS error or network failure - check server configuration');
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);    } catch (error) {
      console.error('Failed to generate regex pattern:', error);
      setResult({
        success: false,
        pattern: '',
        flags: '',
        explanation: error instanceof Error 
          ? error.message 
          : 'Failed to connect to backend. Please make sure the server is running on port 5000.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Test the regex pattern against a sample string
  const testPattern = async () => {
    if (!result?.pattern || !testString) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`${API_ENDPOINT}/regex-builder/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pattern: result.pattern,
          testString 
        }),
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setTestResult(data.success ? {
        isMatch: data.isMatch,
        groups: data.groups
      } : null);
    } catch (error) {
      console.error('Failed to test regex pattern:', error);
      alert('Failed to connect to backend. Please make sure the server is running on port 5050.');
      setTestResult(null);
    } finally {
      setIsTesting(false);
    }
  };

  const copyPattern = () => {
    if (result?.pattern) {
      navigator.clipboard.writeText(result.pattern);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset test when pattern changes
  useEffect(() => {
    setTestResult(null);
  }, [result?.pattern]);

  // Update renderVariablePatternUI with dark theme
  const renderVariablePatternUI = (block: RegexBlock) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Character Set
        </label>
        <select
          value={block.characterSet}
          onChange={(e) => updateBlock(block.id, { 
            characterSet: e.target.value as CharacterSet,
            customCharacters: e.target.value === 'custom' ? '' : undefined
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="digits">Digits (0-9)</option>
          <option value="letters">Letters (a-z, A-Z)</option>
          <option value="lowercase">Lowercase (a-z)</option>
          <option value="uppercase">Uppercase (A-Z)</option>
          <option value="alphanumeric">Alphanumeric (a-z, A-Z, 0-9)</option>
          <option value="symbols">Symbols (!@#$%...)</option>
          <option value="any">Any character</option>
          <option value="custom">Custom character set</option>
        </select>
      </div>

      {block.characterSet === 'custom' && (
        <CharacterSelector
          selectedChars={block.customCharacters || ''}
          onChange={(chars) => updateBlock(block.id, { customCharacters: chars })}
        />
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Length Constraint
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Minimum</label>
            <input
              type="number"
              min="0"
              value={block.length?.min || 0}
              onChange={(e) => updateBlock(block.id, { 
                length: { ...block.length, min: parseInt(e.target.value) || 0 } 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Maximum</label>
            <input
              type="number"
              min={block.length?.min || 0}
              value={block.length?.max || 0}
              onChange={(e) => updateBlock(block.id, { 
                length: { ...block.length, max: parseInt(e.target.value) || 0 } 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={block.length?.exact !== undefined}
              onChange={(e) => {
                if (e.target.checked) {
                  const value = block.length?.min || 1;
                  updateBlock(block.id, { length: { exact: value } });
                } else {
                  const { min, max } = block.length || { min: 1, max: 10 };
                  updateBlock(block.id, { 
                    length: { min: min || 1, max: max || min || 10 } 
                  });
                }
              }}
              className="h-4 w-4 text-blue-600 bg-gray-800 rounded border-gray-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-300">Exact length</span>
          </label>
          {block.length?.exact !== undefined && (
            <input
              type="number"
              min="0"
              value={block.length.exact}
              onChange={(e) => updateBlock(block.id, { 
                length: { exact: parseInt(e.target.value) || 0 } 
              })}
              className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>
    </div>
  );

  // Main UI with dark theme
  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Regex Pattern Builder</h2>
        
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="flex items-start space-x-2 p-4 border border-gray-600 rounded-md bg-gray-800">
              <div className="flex-1">
                {block.type === 'fixed' ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Fixed Text
                    </label>
                    <input
                      type="text"
                      value={block.value || ''}
                      onChange={(e) => updateBlock(block.id, { value: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter fixed text..."
                    />
                  </div>
                ) : (
                  renderVariablePatternUI(block)
                )}
              </div>
              
              <button
                onClick={() => removeBlock(block.id)}
                className="p-2 text-red-400 hover:bg-gray-700 rounded-full"
                title="Remove block"
              >
                <IconTrash size={18} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => addBlock('fixed')}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
          >
            <IconPlus size={18} className="mr-1" /> Add Fixed Text
          </button>
          <button
            onClick={() => addBlock('variable')}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
          >
            <IconPlus size={18} className="mr-1" /> Add Variable Pattern
          </button>
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            onClick={generatePattern}
            disabled={isGenerating || blocks.some(b => (b.type === 'fixed' && !b.value) || !b.type)}
            className={`px-6 py-2 ${isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors font-medium flex items-center`}
          >
            {isGenerating ? (
              <>
                <IconRefresh className="animate-spin mr-2" size={18} />
                Generating...
              </>
            ) : (
              'Generate Regex Pattern'
            )}
          </button>
        </div>
      </div>
      
      {result && (
        <div className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-700">
          <h3 className="text-lg font-medium text-gray-100">Generated Pattern</h3>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1 font-mono p-3 bg-gray-800 text-green-400 rounded-md overflow-x-auto border border-gray-700">
              {result.pattern}
            </div>
            <button
              onClick={copyPattern}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-gray-200"
              title="Copy pattern"
            >
              <IconCopy size={18} className="mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="bg-gray-800 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-300">{result.explanation}</p>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2 text-gray-200">Test Your Pattern</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test string..."
              />
              <button
                onClick={testPattern}
                disabled={!testString || isTesting}
                className={`px-4 py-2 ${isTesting || !testString ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors`}
              >
                {isTesting ? 'Testing...' : 'Test'}
              </button>
            </div>
            
            {testResult !== null && (
              <div className={`mt-4 p-4 rounded-md ${
                testResult.isMatch 
                  ? 'bg-green-900 border border-green-700' 
                  : 'bg-red-900 border border-red-700'
              }`}>
                <div className="flex items-center">
                  {testResult.isMatch ? (
                    <IconCheck className="text-green-400 mr-2" size={20} />
                  ) : (
                    <IconX className="text-red-400 mr-2" size={20} />
                  )}
                  <span className={testResult.isMatch ? 'text-green-300' : 'text-red-300'}>
                    {testResult.isMatch ? 'Pattern matches!' : 'Pattern does not match.'}
                  </span>
                </div>
                
                {testResult.isMatch && testResult.groups && testResult.groups.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-300 mb-1">Captured Groups:</div>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                      {testResult.groups.map((group, i) => (
                        <li key={i}>{group || '(empty)'}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}