'use client';

import { useState, useEffect } from 'react';
import { codeApi } from '@/utils/api';

interface FormattingOptions {
  indentType: 'spaces' | 'tabs';
  indentSize: number;
}

interface ValidationResult {
  valid: boolean;
  errors: string | null;
}

interface FormatResult {
  formatted_code: string;
  errors: string | null;
}

export default function CodeFormatter() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('python');
  const [mode, setMode] = useState<'format' | 'validate'>('format');
  const [options, setOptions] = useState<FormattingOptions>({
    indentType: 'spaces',
    indentSize: 4
  });
  
  const [result, setResult] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'c', label: 'C' }
  ];

  const handleIndentTypeChange = (type: 'spaces' | 'tabs') => {
    setOptions(prev => ({ ...prev, indentType: type }));
  };

  const handleIndentSizeChange = (size: number) => {
    setOptions(prev => ({ ...prev, indentSize: size }));
  };
  
  const processCode = async () => {
    setIsProcessing(true);
    setError(null);
    setResult('');
    setValidationResult(null);
    
    try {
      if (mode === 'format') {
        const response = await codeApi.formatCode({
          code,
          language,
          indent_type: options.indentType,
          indent_size: options.indentSize
        });
        
        if (response.errors) {
          setError(response.errors);
        } else {
          setResult(response.formatted_code);
        }
      } else {
        const response = await codeApi.validateCode({
          code,
          language
        });
        
        setValidationResult(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const getCodeSample = () => {
    switch (language) {
      case 'python':
        return 'def greet(name):\n  print("Hello, " + name + "!")\n\ngreet("World")';
      case 'javascript':
        return 'function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("World");';
      case 'html':
        return '<!DOCTYPE html>\n<html>\n<head>\n<title>Page Title</title>\n</head>\n<body>\n<h1>This is a Heading</h1>\n<p>This is a paragraph.</p>\n</body>\n</html>';
      case 'css':
        return 'body {\n  background-color: lightblue;\n}\n\nh1 {\n  color: white;\n  text-align: center;\n}';
      case 'json':
        return '{\n"name": "John",\n"age": 30,\n"city": "New York"\n}';
      case 'xml':
        return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n<person>\n<name>John</name>\n<age>30</age>\n</person>\n</root>';
      case 'yaml':
        return 'person:\n  name: John\n  age: 30\n  address:\n    city: New York\n    country: USA';
      case 'c':
        return '#include <stdio.h>\n\nint main() {\n  printf("Hello, World!");\n  return 0;\n}';
      default:
        return '';
    }
  };

  const loadSampleCode = () => {
    setCode(getCodeSample());
  };

  return (
    <div className="bg-black rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Code Formatter & Validator</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('format')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'format'
                ? 'bg-blue-600 text-white'
                : 'bg-bgray-800 text-gray-200 hover:bg-gray-600'
            }`}
          >
            Format
          </button>
          <button
            onClick={() => setMode('validate')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'validate'
                ? 'bg-blue-600 text-white'
                : 'bg-bgray-800 text-gray-200 hover:bg-gray-600'
            }`}
          >
            Validate
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="language" className="block text-sm font-medium text-gray-200 mb-1">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {mode === 'format' && (
            <>
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Indentation Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleIndentTypeChange('spaces')}
                    className={`px-3 py-2 text-sm font-medium rounded ${
                      options.indentType === 'spaces'
                        ? 'bg-blue-800 text-blue-100 border border-blue-600'
                        : 'bg-bgray-800 text-gray-200 border border-gray-600'
                    }`}
                  >
                    Spaces
                  </button>
                  <button
                    onClick={() => handleIndentTypeChange('tabs')}
                    className={`px-3 py-2 text-sm font-medium rounded ${
                      options.indentType === 'tabs'
                        ? 'bg-blue-800 text-blue-100 border border-blue-600'
                        : 'bg-bgray-800 text-gray-200 border border-gray-600'
                    }`}
                  >
                    Tabs
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Indent Size: {options.indentSize}
                </label>
                <div className="flex items-center space-x-2">
                  {[2, 4, 6, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleIndentSizeChange(size)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        options.indentSize === size
                          ? 'bg-blue-800 text-blue-100 border border-blue-600'
                          : 'bg-bgray-800 text-gray-200 border border-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="code-input" className="block text-sm font-medium text-gray-200">
              Input Code
            </label>
            <button 
              onClick={loadSampleCode}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Load Sample
            </button>
          </div>
          <div className="relative">
            <textarea
              id="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-80 p-3 font-mono text-sm bg-gray-900 text-gray-200 border border-gray-700 rounded-md shadow-inner focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter your ${language} code here...`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-200">
              {mode === 'format' ? 'Formatted Code' : 'Validation Results'}
            </label>
            {mode === 'format' && result && (
              <button 
                onClick={handleCopyToClipboard}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Copy to Clipboard
              </button>
            )}
          </div>
          <div 
            className={`relative w-full h-80 ${
              mode === 'validate' && validationResult 
                ? validationResult.valid ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700' 
                : 'bg-gray-900 border-gray-700'
            } border rounded-md shadow-inner`}
          >
            {mode === 'format' ? (
              <pre className="p-3 font-mono text-sm h-full overflow-auto whitespace-pre-wrap text-gray-200">
                {result}
              </pre>
            ) : (
              <div className="p-3 h-full overflow-auto">
                {validationResult && (
                  <div>
                    <div className={`mb-4 p-2 rounded-md ${
                      validationResult.valid 
                        ? 'bg-green-900 text-green-100' 
                        : 'bg-red-900 text-red-100'
                    }`}>
                      <div className="flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 mr-2 ${validationResult.valid ? 'text-green-400' : 'text-red-400'}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          {validationResult.valid ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className="font-medium">
                          {validationResult.valid ? 'Valid code!' : 'Invalid code'}
                        </span>
                      </div>
                    </div>

                    {!validationResult.valid && validationResult.errors && (
                      <div className="font-mono text-sm whitespace-pre-wrap text-gray-200">
                        {validationResult.errors}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={processCode}
          disabled={isProcessing || !code.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'format' ? 'Formatting...' : 'Validating...'}
            </div>
          ) : (
            `${mode === 'format' ? 'Format' : 'Validate'} Code`
          )}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}