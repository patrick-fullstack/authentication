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
  email: yup.string().email('Invalid email').required('Email is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
      await forgotPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Forgot Password"
      subtitle={emailSent
        ? 'Password reset link has been sent to your email'
        : 'Enter your email to receive a password reset link'}
    >
      {!emailSent ? (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="email"
            type="email"
            label="Email address"
            error={errors.email?.message}
            placeholder="Email address"
            {...register('email')}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <div className="mt-8">
          <Link href="/login">
            <Button fullWidth>
              Back to Login
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}