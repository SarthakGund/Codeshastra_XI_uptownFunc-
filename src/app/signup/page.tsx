'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, AlertCircle, UserPlus, AtSign, KeyRound, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from "@/utils/api";
import { motion, AnimatePresence } from 'framer-motion';
import OtpVerification from "@/components/auth/OtpVerification";

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  // Check if form is filled for button styling
  useEffect(() => {
    setFormFilled(email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '');
  }, [email, password, confirmPassword]);

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    return { strength, text: texts[strength - 1] || '' };
  };

  const passwordStrength = getPasswordStrength();
  
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
      await authApi.signUp({ email, password });
      setIsOtpSent(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (otp: string) => {
    try {
      await authApi.verifyOtp(email, otp, "signup");
      setIsSignupComplete(true);
    } catch (err: any) {
      console.error("OTP verification error:", err);
      throw new Error(err.response?.data?.message || err.message || "Failed to verify OTP. Please try again.");
    }
  };

  const handleOtpSuccess = async () => {
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/signin');
    }, 2000);
  };

  if (isSignupComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-900/30 p-3 rounded-full">
              <Check className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Account Created Successfully!</h2>
          <p className="text-gray-300 mb-6">
            Your account has been created and verified. You can now sign in to access all the tools.
          </p>
          <Link href="/signin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Sign In to Your Account
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="w-full max-w-md px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-1 rounded-lg shadow-xl"
        >
          <div className="bg-gray-900 rounded-lg shadow-inner p-8">
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <UserPlus size={30} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join our community of developers</p>
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
                  <AlertCircle className="text-red-500 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isOtpSent ? (
                <motion.div
                  key="otp-verification"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OtpVerification 
                    email={email} 
                    type="signup" 
                    onSuccess={handleOtpSuccess} 
                    onVerify={handleOtpVerification} 
                  />
                </motion.div>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                >
                  <div className="mb-5">
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

                  <div className="mb-5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
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
                    
                    {/* Password strength indicator */}
                    {password && (
                      <div className="mt-2">
                        <div className="flex h-1 mt-1 mb-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level}
                              className={`h-full w-1/4 ${level <= passwordStrength.strength 
                                ? level === 1 
                                  ? 'bg-red-500' 
                                  : level === 2 
                                    ? 'bg-orange-500' 
                                    : level === 3 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                : 'bg-gray-700'
                              } ${level < 4 ? 'mr-1' : ''}`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${
                          passwordStrength.strength === 1 ? 'text-red-400' : 
                          passwordStrength.strength === 2 ? 'text-orange-400' : 
                          passwordStrength.strength === 3 ? 'text-yellow-400' : 
                          passwordStrength.strength === 4 ? 'text-green-400' : ''
                        }`}>
                          {passwordStrength.text && `Password strength: ${passwordStrength.text}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockKeyhole className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 rounded-md bg-gray-800 border ${
                          confirmPassword && password !== confirmPassword 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-700 focus:ring-blue-500'
                        } text-white focus:outline-none focus:ring-2 transition-all`}
                        placeholder="••••••••"
                        disabled={isLoading || isSuccess}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
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
                        Creating account...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Account created!
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link href="/signin" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign in instead
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
