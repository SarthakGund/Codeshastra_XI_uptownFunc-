'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(email, password);
      
      // Show success message
      setIsSuccess(true);
      
      // Redirect to sign in after short delay
      setTimeout(() => {
        router.push('/tools');
      }, 2000);
      
    } catch (err) {
      console.error('Sign up error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-1 rounded-lg shadow-xl">
          <div className="bg-gray-900 rounded-lg shadow-inner p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join our community of developers</p>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
                <AlertCircle className="text-red-500 mr-3 h-5 w-5 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            {isSuccess && (
              <div className="bg-green-900/30 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-center">
                <Check className="text-green-500 mr-3 h-5 w-5" />
                <p className="text-sm text-green-200">Account created successfully! Redirecting to sign in...</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  disabled={isLoading || isSuccess}
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading || isSuccess}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading || isSuccess}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full py-3 px-4 flex justify-center items-center rounded-md font-medium transition-colors ${
                  isSuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } ${isLoading || isSuccess ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : isSuccess ? (
                  <Check className="h-5 w-5 mr-2" />
                ) : null}
                {isLoading ? 'Creating account...' : isSuccess ? 'Account created!' : 'Create Account'}
              </button>
            </form>
            
            <p className="mt-6 text-center text-gray-400">
              Already have an account?{' '}
              <Link href="/signin" className="text-blue-400 hover:text-blue-300">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
