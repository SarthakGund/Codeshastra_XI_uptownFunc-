"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, AlertCircle, ArrowRight, Mail, KeyRound, Eye, EyeOff, RefreshCw, Fingerprint } from "lucide-react";
import { sendResetOtp, verifyResetOtp } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Set new password & verify OTP
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const router = useRouter();

  // Check if the current step's form is filled
  useEffect(() => {
    if (step === 1) {
      setFormFilled(email.trim() !== '');
    } else {
      setFormFilled(
        newPassword.trim() !== '' && 
        confirmPassword.trim() !== '' && 
        otp.trim().length > 3
      );
    }
  }, [email, newPassword, confirmPassword, otp, step]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);

    try {
      await sendResetOtp(email);
      setStep(2);
    } catch (err: any) {
      console.error("Error sending reset OTP:", err);
      setError(err.message || err.response?.data?.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate password
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);

    try {
      await verifyResetOtp(email, otp, newPassword);
      setIsSuccess(true);
      
      // Wait for the success animation and redirect
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!newPassword) return { strength: 0, text: '' };
    
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    return { strength, text: texts[strength - 1] || '' };
  };

  const passwordStrength = getPasswordStrength();

  if (isSuccess) {
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
          <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successfully!</h2>
          <p className="text-gray-300 mb-6">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link href="/signin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Sign In Now
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
                <RefreshCw size={30} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400">
                {step === 1
                  ? "Enter your email to receive a verification code"
                  : "Enter the verification code and set your new password"
                }
              </p>
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
              {step === 1 ? (
                <motion.form 
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRequestOtp}
                >
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="you@example.com"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !formFilled}
                    whileHover={{ scale: formFilled ? 1.02 : 1 }}
                    whileTap={{ scale: formFilled ? 0.98 : 1 }}
                    className={`w-full py-3 px-4 flex justify-center items-center rounded-md font-medium transition-all ${
                      formFilled
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-700 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form 
                  key="reset-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleResetSubmit}
                >
                  <div className="mb-5">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Fingerprint className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="otp"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium tracking-wide transition-all"
                        placeholder="000000"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Enter the 6-digit code sent to {email}
                    </p>
                  </div>
                  
                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="••••••••"
                        required
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
                    {newPassword && (
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
                        <KeyRound className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 rounded-md bg-gray-800 border ${
                          confirmPassword && newPassword !== confirmPassword 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-700 focus:ring-blue-500'
                        } text-white focus:outline-none focus:ring-2 transition-all`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !formFilled || (newPassword !== confirmPassword)}
                    whileHover={{ scale: formFilled && newPassword === confirmPassword ? 1.02 : 1 }}
                    whileTap={{ scale: formFilled && newPassword === confirmPassword ? 0.98 : 1 }}
                    className={`w-full py-3 px-4 flex justify-center items-center rounded-md font-medium transition-all ${
                      formFilled && newPassword === confirmPassword
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-700 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.p 
                    key="signin-link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-400"
                  >
                    <Link href="/signin" className="text-blue-400 hover:text-blue-300 transition-colors">
                      ← Return to Sign In
                    </Link>
                  </motion.p>
                ) : (
                  <motion.p
                    key="change-email-link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-400"
                  >
                    <button 
                      onClick={() => setStep(1)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      ← Change Email Address
                    </button>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
