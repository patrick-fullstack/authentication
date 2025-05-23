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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Get first page with 3 posts
      fetchPosts(1, 3);
    }
  }, [fetchPosts, user]);

  useEffect(() => {
    setRecentPosts(posts.slice(0, 3));
  }, [posts]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // If not loading but no user, return empty (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Hello, {user.name || 'User'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Welcome to your dashboard
        </p>

        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            You have successfully logged in with two-factor authentication.
          </p>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Posts</h2>
          <Link
            href="/posts"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all posts &rarr;
          </Link>
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {recentPosts.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-700 dark:text-gray-300">No posts yet. Create your first post!</p>
                <Link
                  href="/posts/create"
                  className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Post
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