'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
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

// Updated schema to match server validation
const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string()
    .email('Please include a valid email')
    .required('Email is required'),
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

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      setServerError(null);
      await registerUser(data.name, data.email, data.password);
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
        setServerError(axiosError.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create an account">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <div className="p-3 bg-red-100 text-red-700 rounded-md">{serverError}</div>}

        <div className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Full name"
            error={errors.name?.message}
            placeholder="Full name"
            {...register('name')}
          />

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
          disabled={loading}
          fullWidth
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
}