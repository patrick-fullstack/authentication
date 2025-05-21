'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';
import api from '@/services/api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tempUserId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (otp: string, isRegistration: boolean) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => void;
  setTempUserId: (id: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if endpoints need to be updated based on server routes
  const REGISTRATION_VERIFY_ENDPOINT = '/auth/verify-registration';
  const LOGIN_VERIFY_ENDPOINT = '/auth/verify-login';

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success && data.user) {
            setUser(data.user);
          }
        } catch (error) {
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success && data.userId) {
        setTempUserId(data.userId);
        toast.success('OTP sent to your email');
        router.push('/verify-otp?mode=login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.success && data.userId) {
        setTempUserId(data.userId);
        toast.success('OTP sent to your email');
        router.push('/verify-otp?mode=register');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const verifyOtp = async (otp: string, isRegistration: boolean) => {
    try {
      if (!tempUserId) {
        toast.error('Session expired');
        router.push(isRegistration ? '/register' : '/login');
        return;
      }

      // Update endpoint to match server routes
      const endpoint = isRegistration ? REGISTRATION_VERIFY_ENDPOINT : LOGIN_VERIFY_ENDPOINT;
      const { data } = await api.post(endpoint, { userId: tempUserId, otp });

      if (data.success && data.token) {
        // Store token in cookie instead of localStorage
        Cookies.set('token', data.token, { expires: 30, path: '/' });
        setUser(data.user);
        setTempUserId(null);
        toast.success(isRegistration ? 'Registration successful!' : 'Login successful!');
        
        // Use router.replace for better navigation
        router.replace('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success('Password reset link sent to your email');
        router.push('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Request failed');
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        toast.success('Password reset successful');
        router.push('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        tempUserId,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        setTempUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};