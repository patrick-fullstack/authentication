'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export default function AuthInitializer() {
    const { token, checkAuth } = useAuthStore();

    useEffect(() => {
        // Set auth header on app initialization if token exists
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkAuth();
        }
    }, [token, checkAuth]);

    return null; // This component doesn't render anything
}