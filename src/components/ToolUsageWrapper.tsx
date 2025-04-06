'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useToolAccess } from '@/hooks/useToolAccess';
import { Loader2 } from 'lucide-react';

interface ToolUsageWrapperProps {
  children: ReactNode;
  toolName: string;
}

export function ToolUsageWrapper({ children, toolName }: ToolUsageWrapperProps) {
  // Move ALL hook calls to the top level
  const { canUseTools, remainingUses, isChecking, redirectToUpgrade, isPro, recordToolUsage } = useToolAccess();
  const [hasRecorded, setHasRecorded] = useState(false);
  
  // Only record INITIAL usage on component mount
  useEffect(() => {
    // Only record usage if not already recorded and user is not on pro plan
    if (!hasRecorded && !isPro && canUseTools) {
      recordToolUsage().then(() => {
        setHasRecorded(true);
      });
    }
  }, [hasRecorded, isPro, canUseTools, recordToolUsage]);

  // Skip usage check for pro users entirely
  if (isPro) {
    return <>{children}</>;
  }

  // Expose the recordToolUsage function to child components
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        recordToolUsage: !isPro ? recordToolUsage : undefined 
      });
    }
    return child;
  });

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!canUseTools && !isPro) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Usage Limit Reached</h2>
        <p className="text-gray-300 mb-6">
          You've reached your free limit for using our tools. Upgrade to Pro for unlimited access.
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
  
  return (
    <div>
      {/* Show remaining uses badge for free users only */}
      {!isPro && remainingUses !== null && (
        <div className="mb-4 bg-gray-800 inline-block px-3 py-1 rounded-full text-sm">
          <span className="text-gray-300">Uses remaining: </span>
          <span className="font-bold text-white">{remainingUses}</span>
        </div>
      )}
      
      {childrenWithProps}
    </div>
  );
}