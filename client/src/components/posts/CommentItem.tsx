'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';
import { Comment } from '@/types/post';

interface CommentItemProps {
    postId: string;
    comment: Comment;
}

export default function CommentItem({ postId, comment }: CommentItemProps) {
    const { user } = useAuthStore();
    const { deleteComment } = usePostStore();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const isAuthor = user?.id === comment.user._id;

    const handleDelete = async () => {
        if (confirmDelete) {
            await deleteComment(postId, comment._id);
            setConfirmDelete(false);
        } else {
            setConfirmDelete(true);
        }
    };

    const formattedDate = comment.createdAt
        ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
        : '';

    const getUserInitial = () => {
        if (!comment.user || !comment.user.name) {
            return 'U';
        }
        return typeof comment.user.name === 'string' ? comment.user.name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <div className="py-3">
            <div className="flex">
                <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500/80 to-purple-600/80 flex items-center justify-center text-white text-sm">
                        {getUserInitial()}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.user.name}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 text-sm">
                            {comment.text}
                        </div>
                    </div>
                    <div className="flex mt-1 ml-1 space-x-4 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            {formattedDate}
                        </span>

                        {isAuthor && !confirmDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                            >
                                Delete
                            </button>
                        )}

                        {confirmDelete && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDelete}
                                    className="text-red-500"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}