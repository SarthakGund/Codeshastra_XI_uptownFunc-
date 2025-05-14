import { useAuth } from '@/contexts/AuthContext';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  let token;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken');
  }
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
  
  try {
    const response = await fetch(url, authOptions);
    
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      throw new Error('Session expired. Please sign in again.');
    }
    
    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

// React hook for authenticated fetch
export function useAuthenticatedFetch() {
  const auth = useAuth();
  
  return async (url: string, options: RequestInit = {}) => {
    if (!auth.isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    return authenticatedFetch(url, options);
  };
}
