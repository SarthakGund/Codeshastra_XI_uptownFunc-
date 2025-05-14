import React, { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  type: 'signup' | 'reset_password';
  onSuccess: () => void;
  onVerify: (otp: string) => Promise<void>;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  email, 
  type, 
  onSuccess, 
  onVerify 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only accept numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update the OTP digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the last digit
    setOtp(newOtp);
    
    // If input not empty and not the last box, focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for navigation and backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on empty input
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      await onVerify(otpValue);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    setIsResending(true);
    // Implement API call to resend OTP here
    setTimeout(() => {
      setIsResending(false);
    }, 3000);
  };

  // Handle paste from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    if (!/^\d+$/.test(pasteData)) return;
    
    const digits = pasteData.slice(0, 6).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus on the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(d => !d);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-white mb-3">Verification Code</h3>
      <p className="text-gray-300 mb-5">
        Enter the 6-digit code sent to <span className="font-medium text-blue-400">{email}</span>
      </p>
      
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-5 rounded-md flex items-start animate-fade-in">
          <AlertCircle className="text-red-500 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Boxes */}
        <div className="flex justify-between space-x-2 md:space-x-3">
          {otp.map((digit, index) => (
            <div key={index} className="w-full">
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-full aspect-square text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                disabled={isLoading}
                aria-label={`OTP digit ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          className={`w-full py-3 px-4 flex justify-center items-center rounded-md font-medium transition-all ${
            isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            <>
              Verify Code <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Didn't receive the code?{' '}
            <button 
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className={`text-blue-400 hover:underline focus:outline-none ${
                isResending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default OtpVerification;
