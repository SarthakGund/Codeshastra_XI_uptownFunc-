'use client';

import { useState, useRef, useEffect } from 'react';
import { apiToolsApi } from '@/utils/api';

interface HeaderItem {
  key: string;
  value: string;
  id: string;
}

interface ParamItem {
  key: string;
  value: string;
  id: string;
}

interface ApiResponse {
  status_code: number;
  headers: Record<string, string>;
  body: any;
  elapsed_ms: number;
  request_id: string;
}

export default function ApiClient() {
  // Request configuration
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<HeaderItem[]>([{ key: '', value: '', id: crypto.randomUUID() }]);
  const [params, setParams] = useState<ParamItem[]>([{ key: '', value: '', id: crypto.randomUUID() }]);
  const [body, setBody] = useState<string>('');
  const [timeout, setTimeout] = useState<number>(30);
  const [prettifyResponse, setPrettifyResponse] = useState<boolean>(true);
  
  // Response state
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
  const [activeResponseTab, setActiveResponseTab] = useState<'body' | 'headers'>('body');
  
  // Reference for the request body textarea
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Format the body if JSON is detected
  const formatBody = () => {
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Not valid JSON, ignore formatting
    }
  };
  
  // Add a new header row
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', id: crypto.randomUUID() }]);
  };

  // Remove a header row
  const removeHeader = (id: string) => {
    if (headers.length > 1) {
      setHeaders(headers.filter(header => header.id !== id));
    }
  };

  // Update a header
  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map(header => 
      header.id === id ? { ...header, [field]: value } : header
    ));
  };
  
  // Add a new parameter row
  const addParam = () => {
    setParams([...params, { key: '', value: '', id: crypto.randomUUID() }]);
  };

  // Remove a parameter row
  const removeParam = (id: string) => {
    if (params.length > 1) {
      setParams(params.filter(param => param.id !== id));
    }
  };

  // Update a parameter
  const updateParam = (id: string, field: 'key' | 'value', value: string) => {
    setParams(params.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    ));
  };
  
  // Send the request
  const sendRequest = async () => {
    if (!url) {
      setError('URL is required');
      return;
    }
    
    setLoading(true);
    setResponse(null);
    setError(null);
    
    // Format headers and params objects
    const headersObj: Record<string, string> = {};
    headers.forEach(header => {
      if (header.key.trim()) {
        headersObj[header.key] = header.value;
      }
    });
    
    const paramsObj: Record<string, string> = {};
    params.forEach(param => {
      if (param.key.trim()) {
        paramsObj[param.key] = param.value;
      }
    });
    
    try {
      let bodyContent = body;
      // Try to parse body as JSON if not empty
      if (body.trim()) {
        try {
          bodyContent = JSON.parse(body);
        } catch (e) {
          // If not valid JSON, use as-is
          bodyContent = body;
        }
      }
      
      const response = await apiToolsApi.makeRequest({
        method,
        url,
        headers: headersObj,
        body: bodyContent,
        params: paramsObj,
        timeout
      });
      
      setResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute the request');
    } finally {
      setLoading(false);
    }
  };

  // Adjust textarea height based on content
  useEffect(() => {
    if (bodyTextareaRef.current) {
      bodyTextareaRef.current.style.height = 'auto';
      bodyTextareaRef.current.style.height = `${bodyTextareaRef.current.scrollHeight}px`;
    }
  }, [body]);
  
  // Get response body formatted for display
  const getFormattedResponseBody = () => {
    if (!response || !response.body) return '';
    
    if (typeof response.body === 'string') {
      try {
        // Try to parse as JSON and re-stringify with indentation
        const parsed = JSON.parse(response.body);
        return prettifyResponse ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
      } catch (e) {
        // Not JSON, return as-is
        return response.body;
      }
    } else {
      // Already an object
      return prettifyResponse ? JSON.stringify(response.body, null, 2) : JSON.stringify(response.body);
    }
  };
  
  // Get appropriate status color
  const getStatusColor = () => {
    if (!response) return 'bg-gray-9000';
    
    const status = response.status_code;
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Copy response to clipboard
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(
        activeResponseTab === 'body'
          ? getFormattedResponseBody()
          : JSON.stringify(response.headers, null, 2)
      );
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-md">
      <div className="border-b p-4 flex items-center justify-between">
        {/* <h2 className="text-xl font-bold text-gray-800">REST API Client</h2> */}
        <div className="text-sm text-gray-500">Developer Tools</div>
      </div>
      
      {/* Request Section */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          {/* Method selector */}
          <div className="flex-shrink-0">
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border rounded-md bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          
          {/* URL input */}
          <div className="flex-grow">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          
          {/* Send button */}
          <div className="flex-shrink-0">
            <button
              onClick={sendRequest}
              disabled={loading}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : 'Send'}
            </button>
          </div>
        </div>
        
        {/* Request configuration tabs */}
        <div className="mb-4">
          <div className="border-b">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('params')}
                className={`mr-6 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'params'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Query Params
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`mr-6 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'headers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab('body')}
                className={`mr-6 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'body'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Body
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-2">
            {activeTab === 'params' && (
              <div className="space-y-2">
                {params.map((param, index) => (
                  <div key={param.id} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                    <input
                      type="text"
                      value={param.key}
                      placeholder="Parameter name"
                      onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={param.value}
                      placeholder="Parameter value"
                      onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => removeParam(param.id)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Remove parameter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addParam}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Parameter
                </button>
              </div>
            )}
            
            {activeTab === 'headers' && (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={header.id} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                    <input
                      type="text"
                      value={header.key}
                      placeholder="Header name"
                      onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={header.value}
                      placeholder="Header value"
                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => removeHeader(header.id)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Remove header"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addHeader}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Header
                </button>
              </div>
            )}
            
            {activeTab === 'body' && (
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Request Body {method === 'GET' && <span className="text-yellow-600">(Note: Body is ignored for GET requests)</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={formatBody}
                      className="text-xs bg-gray-900 hover:bg-gray-800 px-2 py-1 rounded"
                      title="Format JSON"
                    >
                      Format JSON
                    </button>
                    <button
                      onClick={() => setBody('')}
                      className="text-xs bg-gray-900 hover:bg-gray-800 px-2 py-1 rounded"
                      title="Clear"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  ref={bodyTextareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Enter request body (e.g., {"name": "John", "age": 30})`}
                  className="w-full p-3 border rounded-md font-mono text-sm h-40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional settings */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="timeout" className="text-sm font-medium text-gray-700">
              Timeout:
            </label>
            <select 
              id="timeout"
              value={timeout} 
              onChange={(e) => setTimeout(parseInt(e.target.value))}
              className="p-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={120}>120s</option>
            </select>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Response section */}
      {response && (
        <div className="border-t">
          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                <span className="font-mono font-bold">{response.status_code}</span>
                <span className="text-sm text-gray-600">{response.elapsed_ms}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyResponse}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy
                </button>
                <div className="flex items-center gap-2">
                  <label htmlFor="prettify" className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="prettify"
                      checked={prettifyResponse}
                      onChange={(e) => setPrettifyResponse(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1 text-sm text-gray-700">Prettify</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Response tabs */}
            <div className="mb-2 border-b">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveResponseTab('body')}
                  className={`mr-6 py-2 border-b-2 text-sm font-medium ${
                    activeResponseTab === 'body'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Response Body
                </button>
                <button
                  onClick={() => setActiveResponseTab('headers')}
                  className={`mr-6 py-2 border-b-2 text-sm font-medium ${
                    activeResponseTab === 'headers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Headers
                </button>
              </nav>
            </div>
            
            {/* Response content */}
            {activeResponseTab === 'body' ? (
              <pre className="p-4 bg-gray-900 rounded-md border overflow-auto font-mono text-sm h-60 whitespace-pre-wrap">{getFormattedResponseBody()}</pre>
            ) : (
              <div className="p-4 bg-gray-900 rounded-md border overflow-auto h-60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Header Name</th>
                      <th className="text-left py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(response.headers).map(([key, value]) => (
                      <tr key={key} className="border-b hover:bg-gray-900">
                        <td className="py-2 pr-4 font-mono">{key}</td>
                        <td className="py-2 font-mono text-gray-700">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              Request ID: {response.request_id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}