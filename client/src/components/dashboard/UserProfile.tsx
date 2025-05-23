'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserProfileProps {
  hideEditButton?: boolean;
}

export default function UserProfile({ hideEditButton }: UserProfileProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!user) {
    return null;
  }

  const handleEditProfile = () => {
    router.push('/account-settings');
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user.name) return 'U';
    return typeof user.name === 'string' ? user.name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="rounded-lg">
      <div className="flex items-center mb-8">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
          {getUserInitial()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name || 'Add Your Name'}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Information</h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-4 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Full Name</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.name || 'Not provided'}</p>
              </div>

              {!hideEditButton && (
                <button
                  onClick={() => router.push('/account-settings')}
                  className="text-pink-500 text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Address</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Account ID</h4>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]">{user.id}</p>
                <button
                  className="ml-2 text-pink-500"
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    alert('Account ID copied to clipboard');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {!hideEditButton && (
          <button
            onClick={handleEditProfile}
            className="w-full py-3 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 text-sm font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}