'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SqlConverter() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SQL Dialect Converter state
  const [sourceSql, setSourceSql] = useState('');
  const [sourceDialect, setSourceDialect] = useState('MySQL');
  const [targetDialect, setTargetDialect] = useState('PostgreSQL');
  const [convertedSql, setConvertedSql] = useState('');

  // Mock Data Generator state
  const [tableSchema, setTableSchema] = useState('');
  const [numRecords, setNumRecords] = useState(10);
  const [mockData, setMockData] = useState<any[]>([]);

  // SQL to Schema state
  const [createTableSql, setCreateTableSql] = useState('');
  const [jsonSchema, setJsonSchema] = useState<any>(null);

  const sqlDialects = ['MySQL', 'PostgreSQL', 'SQLite', 'SQL Server', 'Oracle'];

  const handleConvertSql = async () => {
    setIsLoading(true);
    setError(null);
    setConvertedSql('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/sql-convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_sql: sourceSql,
          source_dialect: sourceDialect,
          target_dialect: targetDialect,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert SQL');
      }

      setConvertedSql(data.converted_sql);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while converting SQL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMock = async () => {
    setIsLoading(true);
    setError(null);
    setMockData([]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/sql-generate-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_schema: tableSchema,
          num_records: numRecords,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate mock data');
      }

      setMockData(data.mock_data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating mock data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSqlToSchema = async () => {
    setIsLoading(true);
    setError(null);
    setJsonSchema(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/sql-to-schema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          create_table_sql: createTableSql,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert SQL to schema');
      }

      setJsonSchema(data.schema);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while converting SQL to schema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">SQL Tools</h2>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex border-b border-gray-700">
          <Tab className={({ selected }) =>
            `py-2 px-4 text-sm font-medium focus:outline-none ${
              selected ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            SQL Dialect Converter
          </Tab>
          <Tab className={({ selected }) =>
            `py-2 px-4 text-sm font-medium focus:outline-none ${
              selected ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            Mock Data Generator
          </Tab>
          <Tab className={({ selected }) =>
            `py-2 px-4 text-sm font-medium focus:outline-none ${
              selected ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            SQL to Schema
          </Tab>
        </Tab.List>
        
        <Tab.Panels className="mt-4">
          {/* SQL Dialect Converter */}
          <Tab.Panel>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Source Dialect</label>
                <select 
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={sourceDialect}
                  onChange={(e) => setSourceDialect(e.target.value)}
                >
                  {sqlDialects.map(dialect => (
                    <option key={dialect} value={dialect}>{dialect}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Source SQL</label>
                <textarea 
                  className="block w-full h-40 bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-mono"
                  placeholder="Enter your SQL query here..."
                  value={sourceSql}
                  onChange={(e) => setSourceSql(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target Dialect</label>
                <select 
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={targetDialect}
                  onChange={(e) => setTargetDialect(e.target.value)}
                >
                  {sqlDialects.map(dialect => (
                    <option key={dialect} value={dialect}>{dialect}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <button
                  onClick={handleConvertSql}
                  disabled={!sourceSql || isLoading}
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
                  ) : 'Convert SQL'}
                </button>
              </div>
              
              {convertedSql && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Converted SQL</label>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter language="sql" style={vscDarkPlus}>
                      {convertedSql}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>
          
          {/* Mock Data Generator */}
          <Tab.Panel>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Schema (CREATE TABLE statement)</label>
                <textarea 
                  className="block w-full h-40 bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-mono"
                  placeholder="Enter your CREATE TABLE statement here..."
                  value={tableSchema}
                  onChange={(e) => setTableSchema(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Number of Records</label>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={numRecords}
                  onChange={(e) => setNumRecords(parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <button
                  onClick={handleGenerateMock}
                  disabled={!tableSchema || isLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : 'Generate Mock Data'}
                </button>
              </div>
              
              {mockData.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Generated Mock Data</label>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter language="json" style={vscDarkPlus}>
                      {JSON.stringify(mockData, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>
          
          {/* SQL to Schema */}
          <Tab.Panel>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">CREATE TABLE SQL</label>
                <textarea 
                  className="block w-full h-40 bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-mono"
                  placeholder="Enter your CREATE TABLE statement here..."
                  value={createTableSql}
                  onChange={(e) => setCreateTableSql(e.target.value)}
                />
              </div>
              
              <div>
                <button
                  onClick={handleSqlToSchema}
                  disabled={!createTableSql || isLoading}
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
                  ) : 'Convert to Schema'}
                </button>
              </div>
              
              {jsonSchema && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">JSON Schema</label>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter language="json" style={vscDarkPlus}>
                      {JSON.stringify(jsonSchema, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border-l-4 border-red-500 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

      {/* How to use guide */}
      <div className="mt-8 bg-black p-4 rounded-md">
        <h3 className="font-medium text-gray-200 mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
          <li>Select the SQL tool you want to use from the tabs above</li>
          <li>Fill in the required information</li>
          <li>Click the button to perform the operation</li>
          <li>View the results displayed below</li>
        </ol>
      </div>
    </div>
  );
}