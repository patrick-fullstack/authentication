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
    <form onSubmit={handleSubmit} className="mt-6 mb-6">
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add a comment
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Write your comment here..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !commentText.trim()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}