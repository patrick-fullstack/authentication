'use client';

import { ToastContainer } from 'react-toastify';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import AuthInitializer from '@/components/auth/AuthInitializer';
import { AuthProvider } from '@/contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

// Title mapping for different paths
const pageTitles: Record<string, string> = {
  '/': 'Welcome | Social Network',
  '/login': 'Sign In | Social Network',
  '/register': 'Create Account | Social Network',
  '/dashboard': 'Your Dashboard | Social Network',
  '/posts': 'Posts | Social Network',
  '/posts/create': 'Create Post | Social Network',
  '/account-settings': 'Account Settings | Social Network',
  '/forgot-password': 'Reset Password | Social Network',
  '/verify-otp': 'Verify Account | Social Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine if we're on an auth page (login, register, etc.)
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp']
    .some(path => pathname === path || pathname.startsWith(path));

  // Get title based on current path or use a default
  const pageTitle = pageTitles[pathname] || 'Social Network';

  return (
    <html lang="en">
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content="Share your thoughts and connect with friends on Social Network" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="Share your thoughts and connect with friends on Social Network" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-500">
        {/* Wrap everything with AuthProvider */}
        <AuthProvider>
          {/* Initialize auth on app load */}
          <AuthInitializer />

          {/* Only show header when not on auth pages */}
          {!isAuthPage && <Header />}

          {/* Main content */}
          <main className={`flex-grow ${isAuthPage
            ? 'bg-gradient-to-br from-pink-500 to-purple-700 py-12 flex items-center justify-center'
            : 'pt-6'
            } px-4 sm:px-6 lg:px-8`}>
            <div className={isAuthPage ? 'w-full max-w-md' : 'w-full max-w-5xl mx-auto'}>
              {children}
            </div>
          </main>

          {/* Add padding for mobile bottom nav */}
          <div className="md:hidden h-16"></div>

          {/* Only show footer when not on auth pages */}
          {!isAuthPage && <Footer />}

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </body>
    </html>
  );
}