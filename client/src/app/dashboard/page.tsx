'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePostStore } from '@/store/postStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PostItem from '@/components/posts/PostItem';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { posts, fetchPosts, isLoading: postsLoading } = usePostStore();
  const [recentPosts, setRecentPosts] = useState<typeof posts>([]);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Get first page with 5 posts
      fetchPosts(1, 5);
    }
  }, [fetchPosts, user]);

  useEffect(() => {
    setRecentPosts(posts.slice(0, 5));
  }, [posts]);

  if (authLoading || !mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-20 md:pb-10">
      {/* User welcome card */}
      <div className="mb-8 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user.name || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              What is on your mind today?
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            href="/posts/create"
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-md hover:opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Post</span>
          </Link>
        </div>
      </div>

      {/* Recent posts section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Your Feed
          </h2>
          <Link
            href="/posts"
            className="text-sm font-medium text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
          >
            See all
          </Link>
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {recentPosts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No posts in your feed yet. Start by creating your first post!
                </p>
                <Link
                  href="/posts/create"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <PostItem key={post._id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}