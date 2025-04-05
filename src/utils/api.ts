const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

/**
 * Generic function to make API requests
 */
async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    // Remove credentials if you're having issues with CORS
    // credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

// Random Password/Number API
export const randomApi = {
  generateRandomNumber: (data: { start?: number; end?: number }) => 
    apiRequest('/random-no', 'POST', data),
  
  generatePassword: (data: { length?: number; symbols?: boolean; numbers?: boolean }) => 
    apiRequest('/random-pass', 'POST', data),
};

// CSV/Excel Tools API
export const csvExcelApi = {
  convertCsvToExcel: (formData: FormData) => {
    return fetch(`${API_BASE_URL}/csv-to-excel`, {
      method: 'POST',
      body: formData,
    });
  },
  
  convertExcelToCsv: (formData: FormData) => {
    return fetch(`${API_BASE_URL}/excel-to-csv`, {
      method: 'POST',
      body: formData,
    });
  },
};

// Image Generation API
export const imageApi = {
  generateQRCode: (data: { text: string }) => 
    apiRequest('/generate-qrcode', 'POST', data),
  
  generateBarcode: (data: { text: string }) => 
    apiRequest('/generate-barcode', 'POST', data),
  
  convertImage: (formData: FormData) => {
    return fetch(`${API_BASE_URL}/convert-image`, {
      method: 'POST',
      body: formData
    }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || `API request failed with status ${response.status}`);
        });
      }
      return response.json();
    });
  }
};

// Network Tools API
export const networkToolsApi = {
  lookupIp: (data: { ip: string }) => 
    apiRequest('/ip-lookup', 'POST', data),
  
  lookupDns: (data: { domain: string }) => 
    apiRequest('/dns-lookup', 'POST', data),
  
  pingHost: (data: { target: string; count?: number }) => 
    apiRequest('/ping', 'POST', data),
  
  traceroute: (data: { target: string; max_hops?: number }) => 
    apiRequest('/traceroute', 'POST', data),
};

// API Tools
export const apiToolsApi = {
  makeRequest: (data: { 
    method: string; 
    url: string; 
    headers?: Record<string, string>; 
    body?: any;
    params?: Record<string, string>;
    timeout?: number;
  }) => apiRequest('/request', 'POST', data),
};

// Code Formatters/Validators API
export const codeApi = {
  formatCode: (data: { 
    code: string; 
    language: string; 
    indent_type?: 'spaces' | 'tabs'; 
    indent_size?: number;
  }) => apiRequest('/format', 'POST', data),
  
  validateCode: (data: { code: string; language: string }) => 
    apiRequest('/validate', 'POST', data),
};