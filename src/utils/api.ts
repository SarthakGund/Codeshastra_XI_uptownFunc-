const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(endpoint: string, method: string = 'GET', data?: any, requiresAuth: boolean = true) {
  
  try {
    const url = `${API_ENDPOINT}/api/${endpoint}`;
    
    // Get auth token from localStorage
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }
    
    // If authentication is required but no token exists, throw an error
    if (requiresAuth && !token) {
      throw new Error('Authentication required. Please sign in to continue.');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      ...(data ? { body: JSON.stringify(data) } : {}),
      credentials: 'include',
      mode: 'cors',
      cache: 'no-cache',
    });
  
    if (!response.ok) {
      if(response.status === 0) {
        throw new Error('CORS error or network failure - check server configuration');
      }
      
      // Handle 401 unauthorized errors (typically expired tokens)
      if (response.status === 401) {
        // Clear the token as it's invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      // Handle 403 forbidden errors (typically for usage limits)
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access denied. You may have reached your usage limit.');
      }
      
      throw new Error(`API error: ${response.status}`);
    }
  
    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} request to ${endpoint}:`, error);
    throw error;
  }
}

// Authentication APIs
export const authApi = {
  // Going back to Firebase-based authentication
  signIn: (data: { email: string; password: string }) => {
    return apiRequest('signin', 'POST', data, false)
      .then(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        return response;
      });
  },
    
  signUp: (data: { email: string; password: string }) => {
    return apiRequest('signup', 'POST', data, false)
      .then(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        return response;
      });
  },
    
  signOut: async () => {
    try {
      // First make the API call while we still have the token
      try {
        await apiRequest('signout', 'POST', undefined, false);
      } catch (error) {
        console.warn('Backend sign-out failed, but proceeding with client-side logout');
      }
      
      // Then remove the token after API call (successful or not)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error during sign-out:', error);
      // Ensure token is removed even if there's an error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      return { success: true }; // Still return success since we've removed the token
    }
  },
    
  getCurrentUser: async () => {
    return await apiRequest('user-profile', 'GET');
  },
  
  getUserProfile: async () => {
    return await apiRequest('user-profile', 'GET');
  }
};

// User plan and subscription APIs
export const planApi = {
  getUserPlan: async () => {
    try {
      const response = await apiRequest('get-user-plan', 'GET');
      return response;
    } catch (error) {
      console.error("Error getting user plan:", error);
      return { plan: 'free', uses_remaining: 0 };
    }
  },
  
  upgradeToPro: async () => {
    try {
      const response = await apiRequest('upgrade-plan', 'POST');
      // After successful upgrade, update local storage with new plan info
      if (response && response.plan === 'pro') {
        const currentUserString = localStorage.getItem('currentUser');
        if (currentUserString) {
          const currentUser = JSON.parse(currentUserString);
          currentUser.plan = 'pro';
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
      return response;
    } catch (error) {
      console.error("Error upgrading plan:", error);
      throw error;
    }
  },
};

// Tool access and usage APIs
export const toolAccessApi = {
  checkToolAccess: async () => {
    try {
      const response = await apiRequest('check-tool-access', 'GET');
      return response;
    } catch (error) {
      console.error("Error checking tool access:", error);
      return { 
        canUse: false, 
        remainingUses: 0, 
        plan: 'free',
        message: 'Failed to check access status' 
      };
    }
  },
  
  recordToolUsage: async (toolName: string) => {
    try {
      const response = await apiRequest('record-tool-usage', 'POST', { toolName });
      return response;
    } catch (error) {
      console.error("Error recording tool usage:", error);
      throw error;
    }
  },
};

// Random Password/Number API
export const randomApi = {
  generateRandomNumber: (data: { start?: number; end?: number }) => 
    apiRequest('random-no', 'POST', data, true),
  
  generatePassword: (data: { length?: number; symbols?: boolean; numbers?: boolean }) => 
    apiRequest('random-pass', 'POST', data, true),
};

// CSV/Excel Tools API
export const csvExcelApi = {
  convertCsvToExcel: (formData: FormData) => {
    // Check authentication before making the request
    if (typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
      return Promise.reject(new Error('Authentication required. Please sign in to continue.'));
    }
    
    return fetch(`${API_ENDPOINT}/api/csv-to-excel`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  },
  
  convertExcelToCsv: (formData: FormData) => {
    // Check authentication before making the request
    if (typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
      return Promise.reject(new Error('Authentication required. Please sign in to continue.'));
    }
    
    return fetch(`${API_ENDPOINT}/api/excel-to-csv`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  },
};

// Image Generation API Types
export interface QRCodeRequest {
  text: string;
}

export interface BarcodeRequest {
  text: string;
}

export interface ImageConversionRequest {
  image: File;
  format: string;
}

// Image Generation API
export const imageApi = {
  generateQRCode: async (data: QRCodeRequest): Promise<string> => 
    apiRequest('generate-qrcode', 'POST', data),
  
  generateBarcode: async (data: BarcodeRequest): Promise<string> => 
    apiRequest('generate-barcode', 'POST', data),
  
  convertImage: async (data: ImageConversionRequest): Promise<string> => 
    apiRequest('convert-image', 'POST', data)
};

// Network Tools API
export const networkToolsApi = {
  lookupIp: (data: { ip: string }) => 
    apiRequest('ip-lookup', 'POST', data),
  
  lookupDns: (data: { domain: string }) => 
    apiRequest('dns-lookup', 'POST', data),
  
  pingHost: (data: { target: string; count?: number }) => 
    apiRequest('ping', 'POST', data),
  
  traceroute: (data: { target: string; max_hops?: number }) => 
    apiRequest('traceroute', 'POST', data),
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
  }) => apiRequest('request', 'POST', data),
};

// Code Formatters/Validators API
export const codeApi = {
  formatCode: (data: { 
    code: string; 
    language: string; 
    indent_type?: 'spaces' | 'tabs'; 
    indent_size?: number;
  }) => apiRequest('format', 'POST', data),
  
  validateCode: (data: { code: string; language: string }) => 
    apiRequest('validate', 'POST', data),
};