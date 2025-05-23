'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePostStore } from '@/store/postStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PostItem from '@/components/posts/PostItem';
import CommentForm from '@/components/posts/CommentForm';
import CommentItem from '@/components/posts/CommentItem';

interface PostDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
    const { id } = use(params);
    const { user, isLoading: authLoading } = useAuth();
    const { fetchPost, currentPost, isLoading, clearCurrentPost } = usePostStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const loadPost = async () => {
            await fetchPost(id);
        };

        if (user && mounted) {
            loadPost();
        }

        return () => {
            clearCurrentPost();
        };
    }, [fetchPost, id, clearCurrentPost, user, mounted]);

    if (authLoading || (isLoading && !currentPost) || !mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-[70vh]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!currentPost && !isLoading) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Post not found</p>
                    <Link
                        href="/posts"
                        className="inline-block px-6 py-3 text-pink-500 border border-pink-500 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
                    >
                        &larr; Back to Posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-8 pb-20 md:pb-10">
            <div className="mb-6">
                <Link
                    href="/posts"
                    className="inline-flex items-center space-x-1 text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Feed</span>
                </Link>
            </div>

            {currentPost && (
                <>
                    <PostItem post={currentPost} isDetailView />

                    <div className="mt-6">
                        <h2 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                            Comments ({currentPost.comments.length})
                        </h2>

                        <CommentForm postId={id} />

                        {currentPost.comments.length > 0 ? (
                            <div className="space-y-1">
                                {currentPost.comments.map((comment) => (
                                    <CommentItem
                                        key={comment._id}
                                        postId={id}
                                        comment={comment}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center">
                                <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}