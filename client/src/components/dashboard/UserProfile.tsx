'use client';

import { useAuth } from '@/hooks/useAuth';

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-inner">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Profile</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</h3>
          <p className="mt-1 text-gray-900 dark:text-white">{user.name}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</h3>
          <p className="mt-1 text-gray-900 dark:text-white">{user.email}</p>
        </div>
        
        <div className="sm:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account ID</h3>
          <p className="mt-1 text-gray-900 dark:text-white">{user.id}</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
}