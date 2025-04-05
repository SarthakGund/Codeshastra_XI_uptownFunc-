'use client';

import { useState } from 'react';
import { networkToolsApi } from '@/utils/api';

type Tab = 'ip' | 'dns' | 'ping' | 'traceroute';

export default function NetworkTools() {
  const [activeTab, setActiveTab] = useState<Tab>('ip');
  
  // Form states
  const [ipAddress, setIpAddress] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [pingCount, setPingCount] = useState<number>(4);
  const [maxHops, setMaxHops] = useState<number>(15);
  
  // Results and loading states
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleIpLookup = async () => {
    if (!ipAddress) {
      setError('Please enter an IP address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await networkToolsApi.lookupIp({ ip: ipAddress });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform IP lookup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDnsLookup = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await networkToolsApi.lookupDns({ domain });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform DNS lookup');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePing = async () => {
    if (!target) {
      setError('Please enter a target host or IP');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await networkToolsApi.pingHost({
        target,
        count: pingCount
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute ping');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraceroute = async () => {
    if (!target) {
      setError('Please enter a target host or IP');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await networkToolsApi.traceroute({
        target,
        max_hops: maxHops
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute traceroute');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionForCurrentTab = () => {
    switch (activeTab) {
      case 'ip': return handleIpLookup();
      case 'dns': return handleDnsLookup();
      case 'ping': return handlePing();
      case 'traceroute': return handleTraceroute();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ip':
        return (
          <div>
            <label htmlFor="ipInput" className="block mb-2 font-medium">
              IP Address
            </label>
            <input
              id="ipInput"
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g., 8.8.8.8"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      
      case 'dns':
        return (
          <div>
            <label htmlFor="domainInput" className="block mb-2 font-medium">
              Domain Name
            </label>
            <input
              id="domainInput"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., google.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      
      case 'ping':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="pingTarget" className="block mb-2 font-medium">
                Target Host or IP
              </label>
              <input
                id="pingTarget"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., google.com or 8.8.8.8"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="pingCount" className="block mb-2 font-medium">
                Number of Packets: {pingCount}
              </label>
              <input
                id="pingCount"
                type="range"
                min={1}
                max={10}
                value={pingCount}
                onChange={(e) => setPingCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          </div>
        );
      
      case 'traceroute':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="tracerouteTarget" className="block mb-2 font-medium">
                Target Host or IP
              </label>
              <input
                id="tracerouteTarget"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., google.com or 8.8.8.8"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="maxHops" className="block mb-2 font-medium">
                Maximum Hops: {maxHops}
              </label>
              <input
                id="maxHops"
                type="range"
                min={5}
                max={30}
                value={maxHops}
                onChange={(e) => setMaxHops(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>30</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (activeTab) {
      case 'ip':
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3">IP Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(result).map(([key, value]) => (
                <div key={key} className="border-b pb-1">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                  <span className="text-gray-700">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'dns':
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3">DNS Lookup Results</h3>
            <div className="mb-3">
              <p><span className="font-medium">Domain:</span> {result.domain}</p>
            </div>
            {result.ip && (
              <div className="mb-3">
                <p><span className="font-medium">Primary IP:</span> {result.ip}</p>
              </div>
            )}
            {result.all_ips && result.all_ips.length > 0 && (
              <div>
                <p className="font-medium mb-1">All IPs:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.all_ips.map((ip: string, index: number) => (
                    <li key={index} className="text-gray-700">{ip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      case 'ping':
        return (
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-lg font-semibold">Ping Results</h3>
            
            {result.statistics && (
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Min</p>
                    <p className="font-medium">{result.statistics.min_ms} ms</p>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Max</p>
                    <p className="font-medium">{result.statistics.max_ms} ms</p>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="font-medium">{result.statistics.avg_ms} ms</p>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Packet Loss</p>
                    <p className="font-medium">{result.statistics.packet_loss_percent}%</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-2">Response</h4>
              <pre className="bg-black text-green-400 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {result.output}
              </pre>
            </div>
          </div>
        );
      
      case 'traceroute':
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3">Traceroute Results for {result.target}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Hop</th>
                    <th className="py-2 px-4 border-b text-left">IP Address</th>
                    <th className="py-2 px-4 border-b text-left">Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {result.hops.map((hop: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 border-b">{hop.ttl}</td>
                      <td className="py-2 px-4 border-b">{hop.ip}</td>
                      <td className="py-2 px-4 border-b">
                        {hop.rtt !== null ? `${hop.rtt} ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return (
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Network Tools</h2>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <div className="flex flex-wrap">
          <button
            onClick={() => {
              setActiveTab('ip');
              setResult(null);
              setError(null);
            }}
            className={`px-4 py-2 mr-2 mb-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === 'ip'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            IP Lookup
          </button>
          
          <button
            onClick={() => {
              setActiveTab('dns');
              setResult(null);
              setError(null);
            }}
            className={`px-4 py-2 mr-2 mb-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === 'dns'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            DNS Lookup
          </button>
          
          <button
            onClick={() => {
              setActiveTab('ping');
              setResult(null);
              setError(null);
            }}
            className={`px-4 py-2 mr-2 mb-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === 'ping'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            Ping
          </button>
          
          <button
            onClick={() => {
              setActiveTab('traceroute');
              setResult(null);
              setError(null);
            }}
            className={`px-4 py-2 mr-2 mb-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === 'traceroute'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            Traceroute
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Input Form */}
        <div className="bg-gray-50 p-4 rounded-md">
          {renderTabContent()}
          
          <div className="mt-4">
            <button
              onClick={handleActionForCurrentTab}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                `Run ${activeTab === 'ip' ? 'IP Lookup' : activeTab === 'dns' ? 'DNS Lookup' : activeTab === 'ping' ? 'Ping' : 'Traceroute'}`
              )}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
        
        {/* Results */}
        {result && (
          <div className="border-t pt-4">
            {renderResult()}
          </div>
        )}
      </div>
    </div>
  );
}