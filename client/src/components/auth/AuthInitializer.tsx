'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Cookies from 'js-cookie';

export default function AuthInitializer() {
    const { token, checkAuth } = useAuthStore();

    useEffect(() => {
        // Only run this once on component mount
        const initAuth = async () => {
            // Get token directly from cookie as a fallback
            const tokenFromCookie = Cookies.get("token");

            // If we have a token (either from store or cookie), set it in headers
            const authToken = token || tokenFromCookie;

            if (authToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

                // If token was only in cookie but not in store, we need to restore it
                if (!token && tokenFromCookie) {

                }
            }

            // Then verify with the server
            await checkAuth();
        };

        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once

    return null;
}