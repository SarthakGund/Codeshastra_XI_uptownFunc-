'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

type ConversionType = 'csv-to-excel' | 'excel-to-csv';

export default function CsvExcelConverter() {
  const [conversionType, setConversionType] = useState<ConversionType>('csv-to-excel');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = {
    'csv-to-excel': ['.csv'],
    'excel-to-csv': ['.xlsx', '.xls']
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    validateFile(selectedFile);
  };

  const validateFile = (selectedFile: File) => {
    // Check file extension
    const extension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    const validExtensions = allowedExtensions[conversionType];
    
    if (!validExtensions.includes(extension)) {
      setError(`Invalid file format. Please select a ${validExtensions.join(' or ')} file.`);
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the limit (10MB).');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    validateFile(droppedFile);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:5050/api/${conversionType}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      // Get filename from Content-Disposition header or fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = conversionType === 'csv-to-excel' 
        ? file.name.replace('.csv', '.xlsx') 
        : file.name.replace(/\.xlsx?$/, '.csv');

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Reset form on success
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => {
            setConversionType('csv-to-excel');
            resetForm();
          }}
          className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
            conversionType === 'csv-to-excel'
              ? 'bg-black text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
          CSV to Excel
        </button>
        
        <button
          onClick={() => {
            setConversionType('excel-to-csv');
            resetForm();
          }}
          className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
            conversionType === 'excel-to-csv'
              ? 'bg-black text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 17 12 21 16 17" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
          </svg>
          Excel to CSV
        </button>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-100">
          {conversionType === 'csv-to-excel' ? 'Convert CSV to Excel' : 'Convert Excel to CSV'}
        </h2>

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-black' : 'border-gray-700 hover:border-gray-500'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept={allowedExtensions[conversionType].join(',')}
            className="hidden"
            ref={fileInputRef}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {conversionType === 'csv-to-excel' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-300">
                {file ? file.name : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {file 
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB` 
                  : `or ${' '}`}
                {!file && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 font-medium focus:outline-none"
                  >
                    browse for files
                  </button>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {conversionType === 'csv-to-excel' 
                  ? 'Supports .CSV files up to 10MB' 
                  : 'Supports .XLSX and .XLS files'}
              </p>
            </div>
            
            {file && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={resetForm}
                  className="text-red-400 hover:text-red-300 text-sm focus:outline-none"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border-l-4 border-red-500 rounded-md">
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

        {/* Convert Button */}
        <div className="mt-6">
          <button
            onClick={handleConvert}
            disabled={!file || isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </div>
            ) : (
              `Convert to ${conversionType === 'csv-to-excel' ? 'Excel' : 'CSV'}`
            )}
          </button>
        </div>

        {/* How to use guide */}
        <div className="mt-8 bg-black p-4 rounded-md">
          <h3 className="font-medium text-gray-200 mb-2">How to use:</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
            <li>Select the conversion type (CSV to Excel or Excel to CSV)</li>
            <li>Upload your file by dragging and dropping or browsing</li>
            <li>Click the Convert button</li>
            <li>Your converted file will automatically download when ready</li>
          </ol>
        </div>
      </div>
    </div>
  );
}