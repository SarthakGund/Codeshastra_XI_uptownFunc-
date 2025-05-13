'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Rocket, AlertTriangle, LogIn } from 'lucide-react';
import useToolAccess from '@/hooks/useToolAccess';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from './AuthGuard';
import { useRouter } from 'next/navigation';

interface ToolUsageWrapperProps {
  children: React.ReactNode;
  toolName: string;
}

export function ToolUsageWrapper({ children, toolName }: ToolUsageWrapperProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Use all hooks unconditionally at the top level
  const { 
    canUseTools, 
    remainingUses, 
    isChecking, 
    redirectToUpgrade, 
    isPro, 
    recordToolUsage 
  } = useToolAccess();
  
  const [hasRecorded, setHasRecorded] = useState(false);
  const isMounted = useRef(true);
  
  // Cleanup function to handle unmounting properly
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Record tool usage effect with proper cleanup
  useEffect(() => {
    // Important: Check authentication status first to prevent actions after sign-out
    if (!isAuthenticated) return;
    
    const recordInitialUsage = async () => {
      if (!hasRecorded && canUseTools && !isPro) {
        try {
          await recordToolUsage(toolName);
          if (isMounted.current) {
            setHasRecorded(true);
          }
        } catch (error) {
          console.error('Failed to record tool usage:', error);
        }
      }
    };
    
    recordInitialUsage();
  }, [isAuthenticated, hasRecorded, isPro, canUseTools, recordToolUsage, toolName]);

  // Prepare the content for rendering to avoid conditional hook calls
  let content;
  
  if (!isAuthenticated) {
    content = (
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 text-center">
        <LogIn size={48} className="text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Authentication Required</h2>
        <p className="text-gray-300 mb-6">
          You need to sign in to use this tool.
        </p>
        <button
          onClick={() => router.push('/signin')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Sign In
        </button>
        <p className="mt-4 text-sm text-gray-400">
          Don't have an account?{' '}
          <button 
            onClick={() => router.push('/signup')}
            className="text-blue-400 hover:underline"
          >
            Sign up now
          </button>
        </p>
      </div>
    );
  } else if (isChecking) {
    content = (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-400">Checking access...</p>
      </div>
    );
  } else if (isPro) {
    content = (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 bg-blue-900/30 px-3 py-1 rounded-full w-fit">
          <Rocket size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Pro Plan</span>
        </div>
        <div>{children}</div>
      </div>
    );
  } else if (canUseTools) {
    content = (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full">
            <span className="text-sm text-gray-300">Uses remaining: </span>
            <span className="font-bold text-white">{remainingUses}</span>
          </div>
          
          <button 
            onClick={redirectToUpgrade}
            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
        
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return child;
          }
          return child;
        })}
      </div>
    );
  } else {
    content = (
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Usage Limit Reached</h2>
        <p className="text-gray-300 mb-6">
          You've reached your limit of 30 free uses. Upgrade to Pro for unlimited access.
        </p>
        <button
          onClick={redirectToUpgrade}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  // Use AuthGuard to ensure user is authenticated
  return (
    <AuthGuard>
      {content}
    </AuthGuard>
  );
}