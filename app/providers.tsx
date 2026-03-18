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
    // This prevents the Public Navbar from ever appearing for a logged-in user.
    useEffect(() => {
        if (isAuthenticated) {
            // Set a placeholder authenticated state while refreshing
            // This ensures useAuth().isAuthenticated is true on the first client render.
            queryClient.setQueryData(['authUser'], { id: -1, username: 'placeholder', isPlaceholder: true });
            refreshAccessToken().then((token) => {
                if (!token) {
                    queryClient.setQueryData(['authUser'], null);
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
