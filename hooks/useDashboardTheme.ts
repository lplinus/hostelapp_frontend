'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export type ThemeMode = 'light' | 'dark' | 'system';

export function isDashboardRoute(pathname: string | null): boolean {
    if (!pathname) return false;
    return (
        pathname === '/dashboard' ||
        pathname.startsWith('/dashboard/') ||
        pathname === '/settings' ||
        pathname.startsWith('/settings/') ||
        pathname === '/rooms' ||
        pathname.startsWith('/rooms/') ||
        pathname === '/bookings' ||
        pathname.startsWith('/bookings/') ||
        pathname === '/hotel' ||
        pathname.startsWith('/hotel/') ||
        pathname === '/hostel' ||
        pathname.startsWith('/hostel/') ||
        pathname === '/hotelbooking' ||
        pathname.startsWith('/hotelbooking/') ||
        pathname === '/vacanrentalbooking' ||
        pathname.startsWith('/vacanrentalbooking/') ||
        pathname === '/subscription' ||
        pathname.startsWith('/subscription/') ||
        pathname === '/notification' ||
        pathname.startsWith('/notification/') ||
        pathname === '/profile' ||
        pathname.startsWith('/profile/') ||
        pathname === '/Aiassitance' ||
        pathname.startsWith('/Aiassitance/') ||
        pathname === '/adsense' ||
        pathname.startsWith('/adsense/') ||
        pathname === '/mydocuements' ||
        pathname.startsWith('/mydocuements/') ||
        pathname === '/help&support' ||
        pathname.startsWith('/help&support/') ||
        pathname.startsWith('/vendordashboard') ||
        pathname.startsWith('/usermarketplace') ||
        pathname === '/home/guestprofile' ||
        pathname.startsWith('/home/guestprofile')
    );
}

export function syncDocumentTheme(pathname: string | null, theme: ThemeMode): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';

    const onDashboard = isDashboardRoute(pathname);
    if (!onDashboard) {
        document.documentElement.classList.remove('dark');
        return 'light';
    }

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved: 'light' | 'dark' = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

    if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    return resolved;
}

export function useDashboardTheme(storageKey: string = 'owner-theme-preference') {
    const pathname = usePathname();
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Initial load
    useEffect(() => {
        try {
            const saved = (localStorage.getItem(storageKey) as ThemeMode) || 'system';
            setThemeState(saved);
            const resolved = syncDocumentTheme(pathname, saved);
            setResolvedTheme(resolved);
        } catch (e) {
            console.error('Error reading theme from localStorage:', e);
        }
        setMounted(true);
    }, [storageKey, pathname]);

    // Handle system theme changes when theme === 'system'
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const resolved = syncDocumentTheme(pathname, 'system');
                setResolvedTheme(resolved);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, pathname]);

    // Listen for custom theme updates across components
    useEffect(() => {
        const handleCustomUpdate = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            if (detail?.storageKey === storageKey && detail?.theme) {
                setThemeState(detail.theme);
                const resolved = syncDocumentTheme(pathname, detail.theme);
                setResolvedTheme(resolved);
            }
        };

        window.addEventListener('dashboard-theme-change', handleCustomUpdate);
        return () => window.removeEventListener('dashboard-theme-change', handleCustomUpdate);
    }, [storageKey, pathname]);

    const setTheme = useCallback(
        (newTheme: ThemeMode) => {
            setThemeState(newTheme);
            try {
                localStorage.setItem(storageKey, newTheme);
            } catch (e) {
                console.error('Error saving theme to localStorage:', e);
            }

            const resolved = syncDocumentTheme(pathname, newTheme);
            setResolvedTheme(resolved);

            window.dispatchEvent(
                new CustomEvent('dashboard-theme-change', {
                    detail: { theme: newTheme, storageKey },
                })
            );
        },
        [storageKey, pathname]
    );

    return {
        theme,
        setTheme,
        resolvedTheme,
        mounted,
    };
}
