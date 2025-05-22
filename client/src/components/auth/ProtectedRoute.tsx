'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, token } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // If not authenticated, not loading, and we've checked for a token, redirect to login
        if (!isAuthenticated && !isLoading && token === null) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router, token]);

    // Show loading state while checking authentication
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    // Only render children if authenticated
    return isAuthenticated ? <>{children}</> : null;
}