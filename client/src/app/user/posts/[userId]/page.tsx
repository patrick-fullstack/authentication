'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserPostsList from '@/components/posts/UserPostsList';
import { useEffect } from 'react';

export default function UserPostsPage() {
    // Get userId from client-side hooks instead
    const params = useParams();
    const userId = params.userId as string;

    // Update document title on client side
    useEffect(() => {
        if (userId) {
            document.title = userId === 'me' ? 'My Posts' : 'User Posts';
        }
    }, [userId]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-10">
            {/* Header with back button */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/posts"
                    className="inline-flex items-center space-x-1 text-accent-color hover:text-accent-hover dark:text-accent-color dark:hover:text-accent-hover"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Feed</span>
                </Link>
            </div>

            {/* User posts component */}
            <UserPostsList userId={userId} />

            {/* Footer navigation */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-500">
                <Link
                    href="/posts"
                    className="text-accent-color hover:text-accent-hover dark:text-accent-color dark:hover:text-accent-hover"
                >
                    View all posts
                </Link>
            </div>
        </div>
    );
}