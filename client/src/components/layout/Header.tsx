'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '../common/ThemeToggle';
import { Notification } from '@/types/notification';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch notifications when authenticated
    if (isAuthenticated && mounted) {
      fetchNotifications();

      // Poll for new notifications every minute
      const interval = setInterval(() => {
        fetchNotifications();
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications, mounted]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
    // When opening notifications, mark them as read
    if (!notificationsOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  const getUserInitial = () => {
    if (!mounted || !user || !user.name) return 'U';
    return typeof user.name === 'string' ? user.name.charAt(0).toUpperCase() : 'U';
  };

  const isActivePath = (path: string) => {
    return pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,8L10.67,8.09C9.81,7.07 7.4,4.5 5,4.5C5,4.5 3.03,7.46 4.96,11.41C4.41,12.24 4.07,12.67 4,13.66L2.07,13.95L2.28,14.93L4.04,14.67L4.18,15.38L2.61,16.32L3.08,17.21L4.53,16.32C5.68,18.76 8.59,20 12,20C15.41,20 18.32,18.76 19.47,16.32L20.92,17.21L21.39,16.32L19.82,15.38L19.96,14.67L21.72,14.93L21.93,13.95L20,13.66C19.93,12.67 19.59,12.24 19.04,11.41C20.97,7.46 19,4.5 19,4.5C16.6,4.5 14.19,7.07 13.33,8.09L12,8z M9,11A1,1 0 0,1 10,12A1,1 0 0,1 9,13A1,1 0 0,1 8,12A1,1 0 0,1 9,11z M15,11A1,1 0 0,1 16,12A1,1 0 0,1 15,13A1,1 0 0,1 14,12A1,1 0 0,1 15,11z M12,7C12,7 13.33,5.57 14.67,5.57C15.99,5.57 17.35,9 12,9C6.65,9 8.01,5.57 9.33,5.57C10.67,5.57 12,7 12,7z" />
              </svg>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent"></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && mounted && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`nav-item p-1 ${isActivePath('/dashboard') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </Link>

              <Link
                href="/posts"
                className={`nav-item p-1 ${isActivePath('/posts') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </Link>

              <Link
                href="/posts/create"
                className="nav-item p-1 text-gray-700 dark:text-gray-300"
              >
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </Link>
              <Link
                href="/user/posts/me"
                className={`nav-item p-1 ${isActivePath('/user/posts') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                  </svg>
                </div>
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={handleNotificationClick}
                  className="icon-button p-1 text-gray-700 dark:text-gray-300 relative"
                  aria-label="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>

                  {/* Notification Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center transform -translate-y-1 translate-x-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-10">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                      <Link
                        href="/notifications"
                        className="header-link text-xs text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View all
                      </Link>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <NotificationPreview onClose={() => setNotificationsOpen(false)} />
                    </div>
                  </div>
                )}
              </div>

              <ThemeToggle />
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center">
            {isAuthenticated && mounted ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="avatar h-8 w-8 rounded-full ring-2 ring-amber-700 overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-700 to-orange-600 text-white">
                    {getUserInitial()}
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-10 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                      <p className="font-medium user-menu-name">{user?.name}</p>
                      <p className="text-xs truncate user-menu-email">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/user/posts/me"
                        className="dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          My Posts
                        </div>
                      </Link>
                      <Link
                        href="/account-settings"
                        className="dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Account Settings
                        </div>
                      </Link>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="dropdown-item block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <ThemeToggle />

                <Link
                  href="/login"
                  className="header-link px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-700 to-orange-600 rounded-full hover:opacity-90"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && mounted && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/dashboard"
              className={`nav-item p-2 rounded-lg ${isActivePath('/dashboard') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            <Link
              href="/posts"
              className={`nav-item p-2 rounded-lg ${isActivePath('/posts') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </Link>

            <Link
              href="/posts/create"
              className="nav-item p-2 rounded-lg text-gray-700 dark:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>

            <Link
              href="/notifications"
              className={`nav-item p-2 rounded-lg relative ${isActivePath('/notifications') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center transform -translate-y-1 translate-x-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/user/posts/me"
              className={`nav-item p-2 rounded-lg ${isActivePath('/account-settings') ? 'active text-amber-700' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// Notification Preview component
function NotificationPreview({ onClose }: { onClose: () => void }) {
  const { notifications, isLoading, deleteNotification } = useNotificationStore();
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    onClose();
    if (notification.post) {
      router.push(`/posts/${notification.post._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No notifications yet
      </div>
    );
  }

  return (
    <div>
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification._id}
          className={`dropdown-item p-3 border-b border-gray-100 dark:border-gray-800 ${!notification.read ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <button
                onClick={() => handleNotificationClick(notification)}
                className="block w-full text-left"
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </button>
            </div>
            <button
              onClick={() => deleteNotification(notification._id)}
              className="ml-2 icon-button p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Delete notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      {notifications.length > 5 && (
        <div className="p-2 text-center">
          <Link
            href="/notifications"
            className="header-link text-xs text-amber-700"
            onClick={onClose}
          >
            View all {notifications.length} notifications
          </Link>
        </div>
      )}
    </div>
  );
}