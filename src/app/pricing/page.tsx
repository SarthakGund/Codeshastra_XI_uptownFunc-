'use client';

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/userService';

const PricingSection: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const router = useRouter();
  
  // Pricing plans data
  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      description: 'Best for occasional users',
      features: [
        'Access to basic tools',
        'Limited API requests',
        'Standard support',
        'Basic functionalities',
        'Single device usage'
      ],
      ctaText: 'Current Plan',
      ctaLink: '#',
      isCurrent: userPlan === 'free'
    },
    {
      name: 'Pro',
      price: '₹10',
      description: 'One-time payment for lifetime access',
      features: [
        'Access to all premium tools',
        'Unlimited API requests',
        'Priority support',
        'Advanced functionalities',
        'Use on unlimited devices',
        'No watermarks on exports',
        'Early access to new features',
        'Offline mode'
      ],
      ctaText: userPlan === 'pro' ? 'Current Plan' : 'Upgrade Now',
      ctaLink: '#',
      isCurrent: userPlan === 'pro'
    }
  ];

  // Fetch user plan from Firestore when component mounts
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const userData = await getUser(user.id);
          if (userData) {
            setUserPlan(userData.plan || 'free');
          } else {
            setUserPlan('free');
          }
        } catch (error) {
          console.error('Error fetching user plan:', error);
          setUserPlan('free'); // Default to free if there's an error
        }
      }
    };

    fetchUserPlan();
  }, [isLoaded, isSignedIn, user]);

  // Handle plan upgrade
  const handleUpgrade = async () => {
    if (!isSignedIn) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/upgrade-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade plan');
      }

      setUserPlan('pro');
      setUpgradeSuccess(true);
      
      // Refresh the page after 2 seconds to show updated state
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="mt-4 text-xl text-gray-300">Select the perfect plan for your needs</p>
          
          {/* Show user's current plan if signed in */}
          {isSignedIn && userPlan && (
            <div className="mt-6 inline-block bg-gray-800 px-4 py-2 rounded-full">
              <p className="text-sm">
                Your current plan: <span className="font-bold uppercase">{userPlan}</span>
              </p>
            </div>
          )}
          
          {/* Success message */}
          {upgradeSuccess && (
            <div className="mt-6 bg-green-900/50 border-l-4 border-green-500 p-4 rounded-md">
              <p className="text-green-200">
                Successfully upgraded to Pro! Enjoy your premium features.
              </p>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="mt-6 bg-red-900/50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-200">{errorMessage}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`flex flex-col h-full rounded-lg overflow-hidden ${
                plan.isCurrent 
                  ? 'bg-blue-900/30 border-2 border-blue-500' 
                  : 'bg-zinc-900'
              }`}
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.isCurrent && (
                    <span className="bg-blue-600 px-2 py-1 rounded-md text-xs font-medium">
                      CURRENT
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.name === 'Pro' && <span className="ml-2 text-lg">lifetime</span>}
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>
                
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center mr-2">
                        <Check size={16} className="text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 mt-auto">
                {plan.name === 'Pro' && userPlan !== 'pro' ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading || upgradeSuccess}
                    className={`block w-full py-4 px-6 text-center font-medium rounded-md transition-colors duration-200 ${
                      isLoading 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                ) : (
                  <div 
                    className={`block w-full py-4 px-6 text-center font-medium rounded-md ${
                      plan.isCurrent 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700'
                    }`}
                  >
                    {plan.isCurrent ? 'Current Plan' : 'Available Plan'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Not signed in prompt */}
        {!isSignedIn && (
          <div className="mt-12 text-center p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Ready to upgrade?</h3>
            <p className="text-gray-300 mb-4">Sign in to your account to upgrade to Pro</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => router.push('/signin')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingSection;