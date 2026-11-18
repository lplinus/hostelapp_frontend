'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isDashboardRoute, syncDocumentTheme, ThemeMode } from '@/hooks/useDashboardTheme';

export default function DashboardThemeWatcher() {
    const pathname = usePathname();

    useEffect(() => {
        if (!isDashboardRoute(pathname)) {
            // Strictly enforce light mode for all public pages
            document.documentElement.classList.remove('dark');
            return;
        }

        const isGuestRoute = pathname.startsWith('/home/guestprofile');
        const storageKey = isGuestRoute ? 'guest-theme-preference' : 'owner-theme-preference';

        try {
            const savedTheme = (localStorage.getItem(storageKey) as ThemeMode) || 'system';
            syncDocumentTheme(pathname, savedTheme);
        } catch (e) {
            syncDocumentTheme(pathname, 'system');
        }
    }, [pathname]);

    return null;
}
