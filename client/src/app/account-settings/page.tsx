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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router, mounted]);

    // Show loading state while checking authentication
    if (isLoading || !mounted) {
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
        <div className="max-w-xl mx-auto pb-20 md:pb-10">
            <div className="mb-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">Account Settings</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'profile'
                            ? 'border-b-2 border-pink-500 text-pink-600 dark:text-pink-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('profile')}
                        type="button"
                    >
                        Profile Information
                    </button>
                    <button
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'security'
                            ? 'border-b-2 border-pink-500 text-pink-600 dark:text-pink-400'
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