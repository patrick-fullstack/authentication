'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Check if path includes any of the public paths (for reset-password/:token case)
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      if (!user && !isPublicPath) {
        router.push('/login');
      } else if (user && isPublicPath) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>;
  }

  return <>{children}</>;
}