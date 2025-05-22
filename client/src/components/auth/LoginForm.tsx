'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
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

// Updated schema to match server validation
const schema = yup.object({
  email: yup.string()
    .email('Please include a valid email')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
});

type FormData = yup.InferType<typeof schema>;

export default function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      if (useAuthStore.getState().tempUserId) {
        router.push('/verify-otp?mode=login');
      }
    } catch (error) {
      console.error(error);
      // Type-safe error handling
      const axiosError = error as AxiosError<ErrorResponse>;

      if (axiosError.response?.data?.errors) {
        // Format error messages from the server
        const errorMessages = axiosError.response.data.errors.map((err) =>
          `${err.path}: ${err.msg}`
        ).join(', ');
        setServerError(errorMessages);
      } else {
        setServerError(axiosError.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <Card title="Sign in to your account">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <div className="p-3 bg-red-100 text-red-700 rounded-md">{serverError}</div>}

        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            error={errors.email?.message}
            placeholder="Email address"
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            error={errors.password?.message}
            placeholder="Password"
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Dont have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
}