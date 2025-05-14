'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, AlertCircle, LogIn, AtSign, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const router = useRouter();
  const { signIn, verifyOtp } = useAuth();

  // Check if form is filled for button styling
  useEffect(() => {
    setFormFilled(
      isOtpRequired 
        ? otp.trim().length === 6 
        : email.trim() !== '' && password.trim() !== ''
    );
  }, [email, password, otp, isOtpRequired]);

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
      const response = await signIn(email, password);

      if (response.isOtpRequired) {
        setIsOtpRequired(true);
      } else {
        handleSuccess();
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to sign in. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyOtp(email, otp);
      handleSuccess();
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to verify OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsSuccess(true);
    
    // Smooth transition before redirect
    setTimeout(() => {
      router.push('/tools');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="w-full max-w-md px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-1 rounded-lg shadow-xl"
        >
          <div className="bg-gray-900 rounded-lg shadow-inner p-8">
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <LogIn size={30} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to continue to your account</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start overflow-hidden"
                >
                  <AlertCircle className="text-red-500 mr-3 h-5 w-5 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-900/30 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-center"
                >
                  <Check className="text-green-500 mr-3 h-5 w-5" />
                  <p className="text-sm text-green-200">Successfully signed in! Redirecting you to tools...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isOtpRequired ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                >
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AtSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="you@example.com"
                        disabled={isLoading || isSuccess}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          Forgot password?
                        </Link>
                      </motion.div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="••••••••"
                        disabled={isLoading || isSuccess}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    whileHover={{ scale: formFilled ? 1.02 : 1 }}
                    whileTap={{ scale: formFilled ? 0.98 : 1 }}
                    className={`w-full py-3 px-4 flex justify-center items-center rounded-md font-medium transition-all ${
                      isSuccess
                        ? 'bg-green-600'
                        : formFilled
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-700 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Signed in!
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleOtpSubmit}
                >
                  <div className="mb-6">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <p className="text-sm text-gray-400 mb-3">
                      Enter the 6-digit code sent to your email
                    </p>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 text-center text-lg font-medium rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                      placeholder="000000"
                      disabled={isLoading || isSuccess}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || isSuccess || otp.length !== 6}
                    whileHover={{ scale: otp.length === 6 ? 1.02 : 1 }}
                    whileTap={{ scale: otp.length === 6 ? 0.98 : 1 }}
                    className={`w-full py-3 px-4 flex justify-center items-center rounded-md font-medium transition-all ${
                      isSuccess
                        ? 'bg-green-600'
                        : otp.length === 6
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-700 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Verified!
                      </>
                    ) : (
                      <>
                        Verify Code <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Create one now
                  </Link>
                </motion.span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
