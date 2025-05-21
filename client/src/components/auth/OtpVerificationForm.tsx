'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '../common/Card';
import Button from '../common/Button';

export default function OtpVerificationForm() {
  const { verifyOtp, tempUserId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  // Create refs for each input
  const inputRefs = Array(6).fill(0).map(() => useRef<HTMLInputElement>(null));

  useEffect(() => {
    // Focus first input on load
    inputRefs[0].current?.focus();
    
    // If no temp userId, redirect to login
    if (!tempUserId) {
      router.push(mode === 'register' ? '/register' : '/login');
    }
  }, [tempUserId, router, mode]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]; // Only take first character
    }
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input if this one is filled
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
          newOtp[i] = pastedData[i];
        }
      }
      
      setOtp(newOtp);
      
      // Focus the appropriate input after paste
      if (pastedData.length < 6) {
        inputRefs[pastedData.length].current?.focus();
      } else {
        inputRefs[5].current?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      return;
    }
    
    try {
      setLoading(true);
      await verifyOtp(otpString, mode === 'register');
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="Verify OTP" 
      subtitle="Enter the 6-digit code sent to your email"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{1}"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </form>
    </Card>
  );
}