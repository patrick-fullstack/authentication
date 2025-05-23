'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
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

  // Check if a path is active (exact match or starts with for nested routes)
  const isActivePath = (path: string) => {
    return pathname === path ||
      (path !== '/dashboard' && pathname?.startsWith(path));
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-900 dark:text-white">AuthApp</span>
            </Link>

            {/* Main navigation for authenticated users */}
            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActivePath('/dashboard')
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/posts"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActivePath('/posts')
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white'
                    }`}
                >
                  Posts
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {user && user.name && typeof user.name === 'string' ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline">{user?.name || 'User'}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1">
                    {/* User info section */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {/* Mobile navigation items (visible in dropdown on small screens) */}
                      <div className="md:hidden border-b border-gray-100 dark:border-gray-700">
                        <Link
                          href="/dashboard"
                          className={`block px-4 py-2 text-sm ${isActivePath('/dashboard')
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/posts"
                          className={`block px-4 py-2 text-sm ${isActivePath('/posts')
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          Posts
                        </Link>
                      </div>

                      <Link
                        href="/account-settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        Account Settings
                      </Link>

                      <Link
                        href="/posts/create"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        Create New Post
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}