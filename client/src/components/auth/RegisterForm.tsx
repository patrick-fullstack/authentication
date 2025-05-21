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

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);

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
      await registerUser(data.name, data.email, data.password);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create an account">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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