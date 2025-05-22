'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '../common/Card';
import Button from '../common/Button';
import { useAuthStore } from '@/store/authStore';

export default function OtpVerificationForm() {
  const { verifyOtp, tempUserId, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Fixed: Use a single ref with an array instead of map function
  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);

  useEffect(() => {
    // Focus first input on load
    inputRefs.current[0]?.focus();

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
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Navigate back on backspace if empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // Only process if it looks like a valid OTP
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = [...otp];

      // Fill each input with the corresponding digit
      for (let i = 0; i < Math.min(6, pastedData.length); i++) {
        newOtp[i] = pastedData[i];
      }

      setOtp(newOtp);

      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only submit if all digits are filled
    if (otp.every(digit => digit)) {
      try {
        const otpString = otp.join('');
        await verifyOtp(otpString, mode === 'register');
        router.replace('/dashboard');
      } catch (error) {
        console.error('Failed to verify OTP:', error);
      }
    }
  };

  return (
    <Card
      title="Verification Required"
      subtitle="Enter the 6-digit code sent to your email"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="flex justify-between space-x-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              // Fixed: Change the ref callback to void return type
              ref={(el: HTMLInputElement | null) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={!otp.every(digit => digit) || isLoading}
          fullWidth
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </form>
    </Card>
  );
}