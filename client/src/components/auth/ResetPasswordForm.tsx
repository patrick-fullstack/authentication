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
import { AxiosError } from 'axios';

// Define interface for server error response
interface ServerValidationError {
  path: string;
  msg: string;
}

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: ServerValidationError[];
}

interface ResetPasswordFormProps {
  token: string;
}

// Updated schema to match server validation
const schema = yup.object({
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*\d)/, 'Password must include at least one number')
    .matches(/^(?=.*[a-z])/, 'Password must include at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Password must include at least one uppercase letter')
    .matches(/^(?=.*[!@#$%^&*])/, 'Password must include at least one special character (!@#$%^&*)'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormData = yup.InferType<typeof schema>;

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
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
      setServerError(null);
      await resetPassword(token, data.password);

      // Mark reset as complete
      setResetComplete(true);

      // Replace current route with login page
      // This happens in the useEffect to ensure consistent behavior
    } catch (error) {
      console.error('Password reset failed:', error);

      // Type-safe error handling
      const axiosError = error as AxiosError<ErrorResponse>;

      if (axiosError.response?.data?.errors) {
        // Format error messages from the server
        const errorMessages = axiosError.response.data.errors.map((err) =>
          `${err.path}: ${err.msg}`
        ).join(', ');
        setServerError(errorMessages);
      } else {
        setServerError(axiosError.response?.data?.message || 'Password reset failed. Please try again.');
      }
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
        {serverError && <div className="p-3 bg-red-100 text-red-700 rounded-md">{serverError}</div>}

        <div className="space-y-4">
          <Input
            id="password"
            type="password"
            label="New password"
            error={errors.password?.message}
            placeholder="New password"
            {...register('password')}
          />

          <div className="text-xs text-gray-600 mt-1">
            <p>Password must:</p>
            <ul className="list-disc pl-5">
              <li>Be at least 8 characters long</li>
              <li>Include at least one number</li>
              <li>Include at least one lowercase letter</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one special character (!@#$%^&*)</li>
            </ul>
          </div>

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