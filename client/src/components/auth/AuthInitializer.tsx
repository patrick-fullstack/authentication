'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export default function AuthInitializer() {
    const { token, checkAuth } = useAuthStore();

    useEffect(() => {
        // Set auth header and cookie on app initialization if token exists
        if (token) {
            // Set the Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Set or refresh the token cookie to ensure middleware can access it
            document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict`;

            checkAuth();
        }
    }, [token, checkAuth]);

    return null;
}