'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePostStore } from '@/store/postStore';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface EditPostFormProps {
    postId: string;
}

export default function EditPostForm({ postId }: EditPostFormProps) {
    const router = useRouter();
    const { fetchPost, updatePost, currentPost, isLoading, clearCurrentPost } = usePostStore();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch post data when component mounts
    useEffect(() => {
        const loadPost = async () => {
            try {
                await fetchPost(postId);
            } catch (err) {
                setError('Failed to load post data');
                console.error(err);
            }
        };

        if (mounted) {
            loadPost();
        }

        // Clear current post when component unmounts
        return () => {
            clearCurrentPost();
        };
    }, [fetchPost, postId, clearCurrentPost, mounted]);

    // Update form when post data is loaded
    useEffect(() => {
        if (currentPost) {
            setTitle(currentPost.title || '');
            setContent(currentPost.content || '');
        }
    }, [currentPost]);

    // Check if user is authorized to edit
    const isAuthor = user && currentPost && user.id === currentPost.author._id;
const isEditor = user && currentPost && currentPost.editors && 
                 Array.isArray(currentPost.editors) &&
                 currentPost.editors.some(editor => editor._id === user.id);
    const canEdit = isAuthor || isEditor;

    useEffect(() => {
        // Redirect if user is not authorized to edit
        if (mounted && currentPost && !canEdit) {
            router.push(`/posts/${postId}`);
        }
    }, [mounted, currentPost, canEdit, router, postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (title.trim() && content.trim()) {
            try {
                const success = await updatePost(postId, title.trim(), content.trim());
                if (success) {
                    router.push(`/posts/${postId}`);
                }
            } catch (err) {
                setError('Failed to update post');
                console.error(err);
            }
        }
    };

    if (!mounted) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (isLoading && !currentPost) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!currentPost && !isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Post not found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">The post you&apos;re trying to edit doesn&apos;t exist or has been removed.</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="mb-6 flex items-center">
                <Link
                    href={`/posts/${postId}`}
                    className="mr-3 text-gray-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Edit Post</h1>
                
                {/* Show editor badge */}
                {isEditor && !isAuthor && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full dark:bg-purple-800 dark:text-purple-100">
                        Editing as Editor
                    </span>
                )}
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
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}