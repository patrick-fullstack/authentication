'use client';

import { useState, useEffect } from 'react';
import { usePostStore } from '@/store/postStore';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/post';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface EditorManagementProps {
  postId: string;
  postAuthorId: string;
}

export default function EditorManagement({ postId, postAuthorId }: EditorManagementProps) {
  const [email, setEmail] = useState('');
  const [editors, setEditors] = useState<User[]>([]);
  const { addEditor, removeEditor, currentPost, isLoading } = usePostStore();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if current user is the post author
  const isAuthor = user?.id === postAuthorId;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentPost && currentPost.editors) {
      setEditors(currentPost.editors);
    }
  }, [currentPost]);

  const handleAddEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const result = await addEditor(postId, email);
      if (result) {
        setEmail('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveEditor = async (editorId: string) => {
    await removeEditor(postId, editorId);
  };

  if (!mounted) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Only show editor management to post author
  if (!isAuthor) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Manage Editors</h3>
      
      <form onSubmit={handleAddEditor} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-grow px-4 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '...' : 'Add'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
          Add a user by their email address to allow them to edit this post
        </p>
      </form>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Current Editors</h4>
          {editors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No editors yet</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {editors.map((editor) => (
                <li key={editor._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{editor.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{editor.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveEditor(editor._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}