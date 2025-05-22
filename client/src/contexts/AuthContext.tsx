'use client';

import React, { createContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';

// Keep the same interface to maintain compatibility
interface AuthContextType {
  user: User | null;
  loading: boolean; // maps to isLoading in Zustand
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
  // Use the Zustand store instead of local state
  const {
    user,
    isLoading,
    tempUserId,
    token,
    login: zustandLogin,
    register: zustandRegister,
    verifyOtp: zustandVerifyOtp,
    forgotPassword: zustandForgotPassword,
    resetPassword: zustandResetPassword,
    logout: zustandLogout,
    checkAuth,
  } = useAuthStore();

  const router = useRouter();

  // Check auth status on component mount
  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  // Create wrapper methods that match the original Context API

  // Login with router navigation
  const login = async (email: string, password: string) => {
    try {
      await zustandLogin(email, password);
      // If successful, we'll have a tempUserId
      if (useAuthStore.getState().tempUserId) {
        router.push('/verify-otp?mode=login');
      }
    } catch (error) {
      // Error is already handled in Zustand store
      throw error;
    }
  };

  // Register with router navigation
  const register = async (name: string, email: string, password: string) => {
    try {
      await zustandRegister(name, email, password);
      // If successful, we'll have a tempUserId
      if (useAuthStore.getState().tempUserId) {
        router.push('/verify-otp?mode=register');
      }
    } catch (error) {
      // Error is already handled in Zustand store
      throw error;
    }
  };

  // Verify OTP with router navigation
  const verifyOtp = async (otp: string, isRegistration: boolean) => {
    try {
      await zustandVerifyOtp(otp, isRegistration);
      // If successful, we'll be authenticated
      if (useAuthStore.getState().isAuthenticated) {
        router.replace('/dashboard');
      }
    } catch (error) {
      // Error is already handled in Zustand store
      throw error;
    }
  };

  // Forgot password with router navigation
  const forgotPassword = async (email: string) => {
    try {
      await zustandForgotPassword(email);
      router.push('/login');
    } catch (error) {
      // Error is already handled in Zustand store
      throw error;
    }
  };

  // Reset password with router navigation
  const resetPassword = async (token: string, password: string) => {
    try {
      await zustandResetPassword(token, password);
      router.push('/login');
    } catch (error) {
      // Error is already handled in Zustand store
      throw error;
    }
  };

  // Logout with router navigation
  const logout = () => {
    zustandLogout();
    router.push('/login');
  };

  // Create a method to set tempUserId directly
  const setTempUserId = (id: string | null) => {
    useAuthStore.setState({ tempUserId: id });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading, // Map isLoading to loading for compatibility
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