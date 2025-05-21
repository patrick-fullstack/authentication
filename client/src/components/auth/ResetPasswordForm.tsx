'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
      await resetPassword(token, data.password);
    } catch (error) {
      // Error is handled in auth context
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
          disabled={loading}
          fullWidth
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </Card>
  );
}