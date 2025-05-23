'use client';

import { useState } from 'react';
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

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-3">
            <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        {comment.user && comment.user.name && typeof comment.user.name === 'string'
                            ? comment.user.name.charAt(0).toUpperCase()
                            : 'U'}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                            {comment.user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formattedDate}
                        </div>
                    </div>
                </div>

                {isAuthor && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleDelete}
                            className={`text-xs ${confirmDelete ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                        >
                            {confirmDelete ? 'Confirm' : 'Delete'}
                        </button>
                        {confirmDelete && (
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-2 text-gray-700 dark:text-gray-300">
                {comment.text}
            </div>
        </div>
    );
}