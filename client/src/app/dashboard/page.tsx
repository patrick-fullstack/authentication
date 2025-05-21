'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UserProfile from '@/components/dashboard/UserProfile';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // If not loading but no user, return empty (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Welcome to the Dashboard</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">You have successfully logged in with 2FA!</p>
      
      <UserProfile />
    </div>
  );
}