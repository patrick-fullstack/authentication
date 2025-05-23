'use client';

import { useState } from 'react';
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

    const isAuthor = user?.id === post.author._id;
    const isLiked = post.likes.includes(user?.id || '');
    const likeCount = post.likes.length;
    const commentCount = post.comments.length;

    const handleLike = async () => {
        await likePost(post._id);
    };

    const handleDelete = async () => {
        if (confirmDelete) {
            const success = await deletePost(post._id);
            if (success && !isDetailView) {
                // If we're in the feed view, no need to navigate
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
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {isDetailView ? (
                            post.title
                        ) : (
                            <Link href={`/posts/${post._id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                {post.title}
                            </Link>
                        )}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Posted by {post.author.name} • {formattedDate}
                    </p>
                </div>

                {isAuthor && (
                    <div className="flex space-x-2">
                        <Link
                            href={`/posts/edit/${post._id}`}
                            className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className={`text-sm ${confirmDelete ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                        >
                            {confirmDelete ? 'Confirm Delete' : 'Delete'}
                        </button>
                        {confirmDelete && (
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="mb-4">
                {isDetailView ? (
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.content}
                    </div>
                ) : (
                    <div className="text-gray-700 dark:text-gray-300">
                        {post.content.length > 200
                            ? `${post.content.substring(0, 200)}...`
                            : post.content}
                    </div>
                )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 ${isLiked ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>

                    {!isDetailView && (
                        <Link href={`/posts/${post._id}`} className="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
                        </Link>
                    )}
                </div>

                {!isDetailView && (
                    <Link
                        href={`/posts/${post._id}`}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Read more
                    </Link>
                )}
            </div>
        </div>
    );
}