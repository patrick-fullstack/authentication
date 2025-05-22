'use client';

import { ToastContainer } from 'react-toastify';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import AuthInitializer from '@/components/auth/AuthInitializer';
import { AuthProvider } from '@/contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine if we're on an auth page (login, register, etc.)
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp']
    .some(path => pathname === path || pathname.startsWith(path));

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Wrap everything with AuthProvider */}
        <AuthProvider>
          {/* Initialize auth on app load */}
          <AuthInitializer />

          {/* Only show header when not on auth pages */}
          {!isAuthPage && <Header />}

          {/* Main content with different styling based on page type */}
          <main className={`flex-grow flex items-center justify-center ${isAuthPage ? 'bg-gradient-to-br from-indigo-500 to-purple-700 py-12' : 'bg-gray-50 dark:bg-gray-900 py-8'
            } px-4 sm:px-6 lg:px-8`}>
            <div className={isAuthPage ? 'w-full max-w-md' : 'w-full max-w-7xl'}>
              {children}
            </div>
          </main>

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