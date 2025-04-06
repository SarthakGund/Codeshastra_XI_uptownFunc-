'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ANONYMOUS_STORAGE_KEY = 'anonymous_tool_usage';
const MAX_ANONYMOUS_USAGE = 3;

export function useToolAccess() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [canUseTools, setCanUseTools] = useState<boolean>(true);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const router = useRouter();

  // Check if user can access tools
  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;
      
      if (isSignedIn) {
        // For authenticated users, check with the server
        try {
          const response = await fetch('/api/check-tool-access');
          const data = await response.json();
          
          if (data.success) {
            setCanUseTools(data.allowed);
            setRemainingUses(data.remaining);
          } else {
            console.error('Failed to check tool access:', data.error);
            setCanUseTools(false);
          }
        } catch (error) {
          console.error('Error checking tool access:', error);
          setCanUseTools(false);
        }
      } else {
        // For anonymous users, use localStorage
        const storedUsage = localStorage.getItem(ANONYMOUS_STORAGE_KEY);
        const usageCount = storedUsage ? parseInt(storedUsage, 10) : 0;
        const remaining = Math.max(0, MAX_ANONYMOUS_USAGE - usageCount);
        
        setCanUseTools(remaining > 0);
        setRemainingUses(remaining);
      }
      
      setIsChecking(false);
    };
    
    checkAccess();
  }, [isLoaded, isSignedIn, user]);
  
  // Function to record tool usage
  const recordToolUsage = async () => {
    if (!canUseTools) return false;
    
    if (isSignedIn) {
      // Record usage for authenticated users
      try {
        const response = await fetch('/api/increment-tool-usage', {
          method: 'POST',
        });
        const data = await response.json();
        
        if (data.success) {
          // Reduce remaining uses locally for immediate feedback
          if (remainingUses !== null) {
            const newRemaining = remainingUses - 1;
            setRemainingUses(newRemaining);
            setCanUseTools(newRemaining > 0);
          }
          return true;
        } else {
          console.error('Failed to record tool usage:', data.error);
          return false;
        }
      } catch (error) {
        console.error('Error recording tool usage:', error);
        return false;
      }
    } else {
      // Record usage for anonymous users using localStorage
      const storedUsage = localStorage.getItem(ANONYMOUS_STORAGE_KEY);
      const usageCount = storedUsage ? parseInt(storedUsage, 10) : 0;
      const newUsageCount = usageCount + 1;
      
      localStorage.setItem(ANONYMOUS_STORAGE_KEY, newUsageCount.toString());
      
      const newRemaining = Math.max(0, MAX_ANONYMOUS_USAGE - newUsageCount);
      setRemainingUses(newRemaining);
      setCanUseTools(newRemaining > 0);
      
      return newRemaining > 0;
    }
  };
  
  // Redirect to upgrade page when limit is reached
  const redirectToUpgrade = () => {
    router.push('/pricing');
  };
  
  return {
    canUseTools,
    remainingUses,
    isChecking,
    recordToolUsage,
    redirectToUpgrade,
    isPro: isSignedIn && user?.publicMetadata?.plan === 'pro'
  };
}