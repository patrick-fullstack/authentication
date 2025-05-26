'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    // Load saved theme from localStorage when component mounts
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setTheme(savedTheme);
        }
    }, []);

    // Apply theme attribute to html element
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }

        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    const value = { theme, setTheme };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}