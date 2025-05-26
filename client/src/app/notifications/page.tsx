'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    currentPage,
    totalPages,
    isLoading: notificationsLoading, 
    fetchNotifications,
    markAsRead,
    deleteNotification
  } = useNotificationStore();
  
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
    if (user && mounted) {
      fetchNotifications();
    }
  }, [fetchNotifications, user, mounted]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAsRead();
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchNotifications(currentPage + 1);
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'editor_added':
        return (
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'post_mention':
        return (
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy • h:mm a');
  };

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
    <div className="max-w-xl mx-auto px-4 py-8 pb-20 md:pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="notification-link text-sm hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notificationsLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {notifications.length === 0 ? (
            <div className="notification-card rounded-xl p-8 text-center shadow-sm border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto notification-meta mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="notification-empty-text mb-6">
                You don&apos;t have any notifications yet
              </p>
              <Link
                href="/dashboard"
                className="notification-link inline-block px-6 py-3 border rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                &larr; Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`notification-card rounded-xl overflow-hidden shadow-sm border ${
                    !notification.read ? 'notification-unread border-l-4' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      {/* Icon for notification type */}
                      {getNotificationTypeIcon(notification.type)}
                      
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="notification-body">
                              {notification.message}
                            </p>
                            <p className="notification-meta mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Delete notification"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {notification.post && (
                          <div className="mt-2">
                            <Link
                              href={`/posts/${notification.post._id}`}
                              className="notification-link inline-block text-xs font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              View Post
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more button */}
              {currentPage < totalPages && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    className="notification-link px-6 py-2 text-sm font-medium border rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    disabled={notificationsLoading}
                  >
                    {notificationsLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}