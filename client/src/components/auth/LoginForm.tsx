'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const schema = yup.object({
  email: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      if (useAuthStore.getState().tempUserId) {
        router.push('/verify-otp?mode=login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card title="Sign in to your account">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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