'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePostStore } from '@/store/postStore';
import PostItem from './PostItem';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PostsList() {
    const { posts, fetchPosts, isLoading, pagination } = usePostStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchPosts(currentPage);
    }, [fetchPosts, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!mounted) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="pb-20 md:pb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                    Your Feed
                </h1>
                <Link
                    href="/posts/create"
                    className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-full hover:opacity-90 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className='text-white'>New Post</span>
                </Link>
            </div>

            {isLoading && posts.length === 0 ? (
                <div className="flex justify-center py-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {posts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-300 dark:text-amber-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <p className="text-gray-800 dark:text-gray-300 mb-6">
                                No posts in your feed yet. Start by creating your first post!
                            </p>
                            <Link
                                href="/posts/create"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-full hover:opacity-90"
                            >
                                Create Your First Post
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostItem key={post._id} post={post} />
                            ))}
                        </div>
                    )}

                    {/* Instagram-style pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.pages}
                                className="w-full p-3 bg-white dark:bg-gray-800 text-amber-700 font-medium text-center rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {currentPage === pagination.pages ? 'No More Posts' : 'Load More'}
                            </button>

                            {/* Subtle page indicator */}
                            <div className="mt-3 flex justify-center">
                                <div className="flex space-x-1">
                                    {Array.from({ length: pagination.pages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`h-2 w-2 rounded-full ${currentPage === i + 1
                                                ? 'bg-amber-700'
                                                : 'bg-gray-300 dark:bg-gray-600'}`}
                                            aria-label={`Go to page ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}