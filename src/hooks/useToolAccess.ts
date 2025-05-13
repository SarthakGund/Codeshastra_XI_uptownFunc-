import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toolAccessApi } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

interface UseToolAccessResult {
  canUseTools: boolean;
  remainingUses: number | null;
  isChecking: boolean;
  isPro: boolean;
  recordToolUsage: (toolName?: string) => Promise<void>;
  redirectToUpgrade: () => void;
}

export default function useToolAccess(): UseToolAccessResult {
  const [canUseTools, setCanUseTools] = useState<boolean>(true);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isPro, setIsPro] = useState<boolean>(false);
  const router = useRouter();
  const { user, isAuthenticated, refreshUserData } = useAuth();

  // Check if user can access tools
  useEffect(() => {
    let isMounted = true;
    
    const checkAccess = async () => {
      try {
        setIsChecking(true);
        
        // Always set default state for unauthenticated users
        if (!isAuthenticated) {
          if (isMounted) {
            setCanUseTools(false);
            setRemainingUses(0);
            setIsPro(false);
            setIsChecking(false);
          }
          return;
        }
        
        // First get user plan from context if available
        if (user?.plan === 'pro') {
          if (isMounted) {
            setIsPro(true);
            setCanUseTools(true);
            setRemainingUses(null); // No limit for pro users
            setIsChecking(false);
          }
          return;
        }
        
        // If plan isn't pro or isn't available, get fresh data
        const accessData = await toolAccessApi.checkToolAccess();
        
        if (isMounted) {
          setIsPro(accessData.plan === 'pro');
          setCanUseTools(accessData.canUse);
          // For pro users, remainingUses should be null, not a number
          setRemainingUses(accessData.plan === 'pro' ? null : accessData.remainingUses);
        
          // If there's a mismatch with the current user data, refresh it
          if (user && user.plan !== accessData.plan) {
            refreshUserData();
          }
        }
      } catch (error) {
        console.error("Error checking tool access:", error);
        // Default to denying access if check fails
        if (isMounted) {
          setCanUseTools(false);
          setRemainingUses(0);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };
    
    checkAccess();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, refreshUserData]);

  // Function to record tool usage - always defined regardless of authentication state
  const recordToolUsage = useCallback(async (toolName: string = 'tool') => {
    if (!isAuthenticated) return;
    
    try {
      // Only record usage for free users
      const result = await toolAccessApi.recordToolUsage(toolName);
      
      // Update remaining uses for free users
      if (!isPro && result.remainingUses !== undefined) {
        setRemainingUses(result.remainingUses);
        
        // If user has reached their limit, update state
        if (result.remainingUses === 0) {
          setCanUseTools(false);
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error recording tool usage:", error);
      // If we get an access denied error, update the state
      if (error instanceof Error && error.message.includes('No uses remaining')) {
        setCanUseTools(false);
        setRemainingUses(0);
      }
    }
  }, [isPro, isAuthenticated]);

  // Function to redirect to upgrade page - always defined
  const redirectToUpgrade = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  return {
    canUseTools,
    remainingUses,
    isChecking,
    isPro,
    recordToolUsage,
    redirectToUpgrade
  };
}