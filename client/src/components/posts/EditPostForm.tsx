'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePostStore } from '@/store/postStore';

interface EditPostFormProps {
    postId: string;
}

export default function EditPostForm({ postId }: EditPostFormProps) {
    const router = useRouter();
    const { fetchPost, updatePost, currentPost, isLoading, clearCurrentPost } = usePostStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Fetch post data when component mounts
    useEffect(() => {
        const loadPost = async () => {
            await fetchPost(postId);
        };

        loadPost();

        // Clear current post when component unmounts
        return () => {
            clearCurrentPost();
        };
    }, [fetchPost, postId, clearCurrentPost]);

    // Update form when post data is loaded
    useEffect(() => {
        if (currentPost) {
            setTitle(currentPost.title);
            setContent(currentPost.content);
        }
    }, [currentPost]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (title.trim() && content.trim()) {
            const success = await updatePost(postId, title.trim(), content.trim());
            if (success) {
                router.push(`/posts/${postId}`);
            }
        }
    };

    if (isLoading && !currentPost) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!currentPost && !isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <p className="text-red-600 dark:text-red-400">Post not found or you do not have permission to edit it.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Post</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="Enter post title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                    </label>
                    <textarea
                        id="content"
                        rows={8}
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="Write your post content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !title.trim() || !content.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Updating...' : 'Update Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}