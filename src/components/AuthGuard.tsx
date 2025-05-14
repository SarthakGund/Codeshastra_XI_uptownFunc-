'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LockKeyhole } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showAuthError, setShowAuthError] = useState(false);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        setShowAuthError(true);
        
        redirectTimer = setTimeout(() => {
          router.push('/signin');
        }, 1500);
      }
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isLoading, isAuthenticated, requireAuth, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    if (showAuthError) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
            <LockKeyhole className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-300 mb-4">Please sign in to access this feature.</p>
            <p className="text-gray-400 text-sm">Redirecting to sign in page...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
