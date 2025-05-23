'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePostStore } from '@/store/postStore';
import PostItem from './PostItem';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PostsList() {
    const { posts, fetchPosts, isLoading, pagination } = usePostStore();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [fetchPosts, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
                <Link
                    href="/posts/create"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Create Post
                </Link>
            </div>

            {isLoading && posts.length === 0 ? (
                <div className="flex justify-center py-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {posts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
                            <p className="text-gray-700 dark:text-gray-300">No posts found. Be the first to create a post!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostItem key={post._id} post={post} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center mt-8">
                            <nav className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md ${currentPage === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}