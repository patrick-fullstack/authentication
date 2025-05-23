'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostStore } from '@/store/postStore';
import Link from 'next/link';

export default function CreatePostForm() {
    const router = useRouter();
    const { createPost, isLoading } = usePostStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (title.trim() && content.trim()) {
            const success = await createPost(title.trim(), content.trim());
            if (success) {
                router.push('/posts');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="mb-6 flex items-center">
                <Link
                    href="/posts"
                    className="mr-3 text-gray-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Create a New Post</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
                        className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !title.trim() || !content.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Publishing...' : 'Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}