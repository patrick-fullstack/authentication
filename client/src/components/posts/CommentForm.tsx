'use client';

import { useState } from 'react';
import { usePostStore } from '@/store/postStore';

interface CommentFormProps {
    postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
    const { addComment, isLoading } = usePostStore();
    const [commentText, setCommentText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (commentText.trim()) {
            const result = await addComment(postId, commentText.trim());
            if (result) {
                setCommentText('');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 mb-6">
            <div className="flex items-start space-x-2">
                <textarea
                    id="comment"
                    rows={1}
                    className="flex-1 p-3 text-sm text-gray-700 border border-gray-200 dark:border-gray-700 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white resize-none"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                ></textarea>

                <button
                    type="submit"
                    disabled={isLoading || !commentText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isLoading ? '...' : 'Post'}
                </button>
            </div>
        </form>
    );
}