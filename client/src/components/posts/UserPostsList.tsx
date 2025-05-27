'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePostStore } from '@/store/postStore';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PostItem from '@/components/posts/PostItem';

interface UserPostsListProps {
    userId: string;
    limit?: number;
}

export default function UserPostsList({ userId, limit = 10 }: UserPostsListProps) {
    const { user } = useAuth();
    const {
        userPosts,
        userPostsPagination,
        isLoading,
        fetchUserPosts,
        error
    } = usePostStore();
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [username, setUsername] = useState('');
    const [mounted, setMounted] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && user) {
            // Determine if we're viewing current user's posts
            const isUserMe = userId === 'me';
            const actualUserId = isUserMe ? user.id : userId;
            setIsCurrentUser(isUserMe || userId === user.id);

            if (isUserMe) {
                setUsername(user.name || "Your");
            }

            // Fetch posts for this user
            fetchUserPosts(actualUserId, page, limit);
        }
    }, [user, userId, mounted, page, limit, fetchUserPosts]);

    // Set username for another user once posts are loaded
    useEffect(() => {
        if (userPosts.length > 0 && !isCurrentUser && userId !== 'me') {
            setUsername(`${userPosts[0].author.name}'s`);
        }
    }, [userPosts, isCurrentUser, userId]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (!mounted || !user) {
        return (
            <div className="w-full py-12 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
                Error loading posts: {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Title */}
            <h1 className="text-2xl font-bold bg-clip-text text-transparent mb-6">
                {username} Posts
            </h1>

            {/* Create post button - only visible for current user */}
            {isCurrentUser && (
                <div className="mb-6 flex justify-end">
                    <Link
                        href="/posts/create"
                        className="text-sm px-4 py-2 bg-gradient-accent text-white rounded-full hover:opacity-90 shadow-sm"
                    >
                        <span className="text-white">Create Post</span>
                    </Link>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="w-full py-12 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {/* Posts or empty state */}
            {!isLoading && (
                <>
                    {userPosts.length > 0 ? (
                        <div className="space-y-6">
                            {userPosts.map((post) => (
                                <PostItem key={post._id} post={post} />
                            ))}

                            {/* Pagination controls */}
                            {userPostsPagination.pages > 1 && (
                                <div className="flex items-center justify-center space-x-2 mt-8 pb-4">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className={`px-3 py-1 rounded ${page === 1
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-opacity-10 text-accent-color hover:bg-opacity-20'
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: userPostsPagination.pages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 rounded ${page === pageNum
                                                ? 'bg-gradient-accent text-white'
                                                : 'bg-opacity-10 text-accent-color hover:bg-opacity-20'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === userPostsPagination.pages}
                                        className={`px-3 py-1 rounded ${page === userPostsPagination.pages
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-opacity-10 text-accent-color hover:bg-opacity-20'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-accent-color dark:text-accent-hover mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <p className="text-gray-800 dark:text-gray-300 mb-6">
                                {isCurrentUser
                                    ? "You haven't created any posts yet."
                                    : "This user hasn't created any posts yet."}
                            </p>

                            {isCurrentUser && (
                                <Link
                                    href="/posts/create"
                                    className="inline-block px-6 py-3 bg-gradient-accent text-white rounded-full hover:opacity-90"
                                >
                                    Create Your First Post
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}