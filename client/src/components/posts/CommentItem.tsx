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
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-700 to-orange-600 flex items-center justify-center text-white text-sm shadow-sm">
                        {getUserInitial()}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-2 border border-amber-100/70 dark:border-amber-800/30">
                        <div className="font-medium text-text-primary dark:text-text-primary text-sm">
                            {comment.user.name}
                        </div>
                        <div className="text-text-secondary dark:text-text-secondary text-sm">
                            {comment.text}
                        </div>
                    </div>
                    <div className="flex mt-1 ml-1 space-x-4 text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                            {formattedDate}
                        </span>

                        {isAuthor && !confirmDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 font-medium"
                            >
                                Delete
                            </button>
                        )}

                        {confirmDelete && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
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