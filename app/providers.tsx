'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { refreshAccessToken } from '@/lib/auth';

interface ProvidersProps {
    children: React.ReactNode;
    isAuthenticated?: boolean;
}

export default function Providers({ children, isAuthenticated }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient());

    // If the server detected an authenticated session (via HttpOnly cookies),
    // proactively hydrate the auth state into React Query's cache AND refresh.
    useEffect(() => {
        if (isAuthenticated) {
            // Set a placeholder state ONLY if we don't already have one.
            // This prevents flickering Header for returning users.
            const existingUser = queryClient.getQueryData(['authUser']);
            if (!existingUser) {
                queryClient.setQueryData(['authUser'], { id: -1, username: 'placeholder', isPlaceholder: true });
            }

            refreshAccessToken().then((token) => {
                if (!token) {
                    queryClient.setQueryData(['authUser'], null);
                    queryClient.invalidateQueries({ queryKey: ['authUser'] });
                    
                    // Force clear cookies JS can access
                    document.cookie = 'auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
                    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';

                    // Redirect if refresh failure happens on a protected route
                    const isProtectedRoute = 
                        window.location.pathname.startsWith('/dashboard') || 
                        window.location.pathname.startsWith('/profile') || 
                        (window.location.pathname.startsWith('/hostel') && !window.location.pathname.startsWith('/hostels')) ||
                        window.location.pathname.startsWith('/rooms') ||
                        window.location.pathname.startsWith('/bookings');

                    if (isProtectedRoute) {
                        window.location.href = '/login';
                    }
                }
            });
        }
    }, [isAuthenticated, queryClient]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
