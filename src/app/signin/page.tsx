'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
      
      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/tools');
      }, 1000);
      
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error 
        ? err.message
        : 'Failed to sign in. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-1 rounded-lg shadow-xl">
          <div className="bg-gray-900 rounded-lg shadow-inner p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to continue to your account</p>
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
                <p className="text-sm text-green-200">Successfully signed in! Redirecting...</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
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
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
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
                {isLoading ? 'Signing in...' : isSuccess ? 'Signed in!' : 'Sign In'}
              </button>
            </form>
            
            <p className="mt-6 text-center text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
