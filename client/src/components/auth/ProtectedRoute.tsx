'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, token, checkAuth } = useAuthStore();
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const verifyAuth = async () => {
            // If we have a token but aren't authenticated yet, check with server
            if (token && !isAuthenticated && !isLoading) {
                await checkAuth();
            }

            setInitialCheckDone(true);
        };

        verifyAuth();
    }, [token, isAuthenticated, checkAuth, isLoading]);

    useEffect(() => {
        // Only redirect after initial check is complete and not loading
        if (initialCheckDone && !isLoading && !isAuthenticated) {
            console.log("ProtectedRoute: Not authenticated, redirecting to login");
            router.replace('/login');
        }
    }, [initialCheckDone, isAuthenticated, isLoading, router]);

    // Show loading state during initial check or when explicitly loading
    if (isLoading || !initialCheckDone) {
        return <div className="w-full flex justify-center items-center p-8">
            <LoadingSpinner />
        </div>;
    }

    // If authenticated, render children
    return isAuthenticated ? <>{children}</> : null;
}