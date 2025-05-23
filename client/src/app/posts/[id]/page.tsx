'use client';
import { use } from 'react';
import { useEffect } from 'react';
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

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const loadPost = async () => {
            await fetchPost(id);
        };

        if (user) {
            loadPost();
        }

        return () => {
            clearCurrentPost();
        };
    }, [fetchPost, id, clearCurrentPost, user]);

    if (authLoading || (isLoading && !currentPost)) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!currentPost && !isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">Post not found</p>
                    <Link
                        href="/posts"
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        &larr; Back to Posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href="/posts"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    &larr; Back to Posts
                </Link>
            </div>

            {currentPost && (
                <>
                    <PostItem post={currentPost} isDetailView />

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Comments ({currentPost.comments.length})
                        </h2>

                        <CommentForm postId={id} />

                        {currentPost.comments.length > 0 ? (
                            <div className="space-y-4">
                                {currentPost.comments.map((comment) => (
                                    <CommentItem
                                        key={comment._id}
                                        postId={id}
                                        comment={comment}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                <p className="text-gray-700 dark:text-gray-300">No comments yet. Be the first to comment!</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}