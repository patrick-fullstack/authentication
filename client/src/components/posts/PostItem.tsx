'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';
import { Post } from '@/types/post';

interface PostItemProps {
    post: Post;
    isDetailView?: boolean;
}

export default function PostItem({ post, isDetailView = false }: PostItemProps) {
    const { user } = useAuthStore();
    const { likePost, deletePost } = usePostStore();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Check for both author and editor status
    const isAuthor = user?.id === post.author._id;
    const isEditor = post.editors?.some(editor => editor._id === user?.id);
    const isLiked = post.likes.includes(user?.id || '');
    const likeCount = post.likes.length;
    const commentCount = post.comments.length;

    const handleLike = async () => {
        if (!isLikeAnimating) {
            setIsLikeAnimating(true);
            await likePost(post._id);
            setTimeout(() => setIsLikeAnimating(false), 1000);
        }
    };

    const handleDelete = async () => {
        // Only authors can delete posts
        if (!isAuthor) return;

        if (confirmDelete) {
            const success = await deletePost(post._id);
            if (success && !isDetailView) {
                setConfirmDelete(false);
            }
        } else {
            setConfirmDelete(true);
        }
    };

    const formattedDate = post.createdAt
        ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
        : '';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Post Header */}
            <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-700 to-orange-600 flex items-center justify-center text-white">
                    {post.author.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-3 flex-1">
                    <div className="flex items-center">
                        <p className="font-semibold text-text-primary text-sm">
                            {post.author.name}
                        </p>

                        {/* Show role badges */}
                        {isAuthor && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: 'var(--accent-color)',
                                    color: 'var(--card-background)',
                                    opacity: 0.9
                                }}>
                                Author
                            </span>
                        )}
                        {isEditor && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: 'var(--card-border)',
                                    color: 'var(--text-primary)',
                                    opacity: 0.9
                                }}>
                                Editor
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formattedDate}
                    </p>
                </div>

                {/* Show actions for both authors and editors, but with different capabilities */}
                {(isAuthor || isEditor) && (
                    <div className="flex space-x-1">
                        {/* Both authors and editors can edit */}
                        <Link
                            href={`/posts/edit/${post._id}`}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Link>

                        {/* Only authors can delete */}
                        {isAuthor && (
                            <button
                                onClick={handleDelete}
                                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}

                        {/* Only authors see manage editors button (when in detail view) */}
                        {isAuthor && isDetailView && (
                            <Link
                                href={`/posts/${post._id}#editors`}
                                className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-300"
                                aria-label="Manage editors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Post Title */}
            <div className="px-4 pt-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isDetailView ? (
                        post.title
                    ) : (
                        <Link href={`/posts/${post._id}`} className="hover:text-amber-700 dark:hover:text-amber-500">
                            {post.title}
                        </Link>
                    )}
                </h2>
            </div>

            {/* Post Content */}
            <div className="p-4">
                {isDetailView ? (
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.content}
                    </div>
                ) : (
                    <div className="text-gray-700 dark:text-gray-300">
                        {post.content.length > 150
                            ? `${post.content.substring(0, 150)}...`
                            : post.content}
                    </div>
                )}

                {!isDetailView && post.content.length > 150 && (
                    <Link
                        href={`/posts/${post._id}`}
                        className="inline-block mt-2 text-sm text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                        Read more
                    </Link>
                )}

                {/* Show editors information */}
                {post.editors && post.editors.length > 0 && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Editors: </span>
                        {post.editors.length} {post.editors.length === 1 ? 'collaborator' : 'collaborators'}
                    </div>
                )}
            </div>

            {/* Post Actions */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className="flex items-center space-x-1 group"
                            aria-label={isLiked ? "Unlike post" : "Like post"}
                        >
                            <div className={`relative transition-transform ${isLikeAnimating ? 'scale-125' : ''}`}>
                                {isLiked ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                )}
                            </div>
                            <span className={isLiked ? 'text-amber-700' : ''}>
                                {likeCount > 0 ? likeCount : ''}
                            </span>
                        </button>

                        {isDetailView ? (
                            <div className="flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{commentCount}</span>
                            </div>
                        ) : (
                            <Link href={`/posts/${post._id}`} className="flex items-center space-x-1 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{commentCount}</span>
                            </Link>
                        )}
                    </div>

                    {!isDetailView && (
                        <Link
                            href={`/posts/${post._id}`}
                            className="text-sm font-medium text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
                            aria-label="View post details"
                        >
                            View
                        </Link>
                    )}
                </div>

                {/* Delete Confirmation */}
                {confirmDelete && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                        <p className="text-red-700 dark:text-red-400 mb-2">Are you sure you want to delete this post?</p>
                        <div className="flex space-x-2 justify-end">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}