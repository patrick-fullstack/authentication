'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import EditProfile from '@/components/dashboard/EditProfile';
import UserProfile from '@/components/dashboard/UserProfile';

export default function AccountSettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    // Show loading state while checking authentication
    if (isLoading) {
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
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/dashboard"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'profile'
                            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('profile')}
                        type="button"
                    >
                        Profile Information
                    </button>
                    <button
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'security'
                            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('security')}
                        type="button"
                    >
                        Security
                    </button>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'profile' && (
                    <div>
                        <UserProfile hideEditButton />
                    </div>
                )}

                {activeTab === 'security' && (
                    <div>
                        <EditProfile initialTab="password" hideProfileTab />
                    </div>
                )}
            </div>
        </div>
    );
}