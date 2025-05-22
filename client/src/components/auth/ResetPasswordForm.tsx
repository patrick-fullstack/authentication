'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

interface ResetPasswordFormProps {
  token: string;
}

const schema = yup.object({
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormData = yup.InferType<typeof schema>;

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Prevent navigation back to this page after reset
  useEffect(() => {
    // Redirect to login if reset is complete
    if (resetComplete) {
      router.replace('/login?resetSuccess=true');
    }

    // Add browser level protection against refreshing/closing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!resetComplete) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check if token is valid
    if (!token) {
      router.replace('/forgot-password');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token, resetComplete, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await resetPassword(token, data.password);

      // Mark reset as complete
      setResetComplete(true);

      // Replace current route with login page
      // This happens in the useEffect to ensure consistent behavior
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Reset Password"
      subtitle="Enter your new password"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input
            id="password"
            type="password"
            label="New password"
            error={errors.password?.message}
            placeholder="New password"
            {...register('password')}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            error={errors.confirmPassword?.message}
            placeholder="Confirm password"
            {...register('confirmPassword')}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || resetComplete}
          fullWidth
        >
          {loading ? 'Resetting...' : resetComplete ? 'Password Reset' : 'Reset Password'}
        </Button>

        {resetComplete && (
          <div className="text-center text-green-600 font-medium">
            Password reset successful! Redirecting to login...
          </div>
        )}
      </form>
    </Card>
  );
}