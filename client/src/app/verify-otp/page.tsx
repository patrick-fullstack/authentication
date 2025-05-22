'use client';

import OtpVerificationForm from '@/components/auth/OtpVerificationForm';
import { Suspense } from 'react';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading verification...</div>}>
      <OtpVerificationForm />
    </Suspense>
  );
}