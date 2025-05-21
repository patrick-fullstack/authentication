'use client';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  
  return (
    <ResetPasswordForm token={token} />
  );
}