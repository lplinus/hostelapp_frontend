'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VendorSidebar from '@/components/vendordashboard/vendor-sidebar';
import DashboardHeader from '@/components/user/dashboard/dashboard-header';
import { Loader2 } from 'lucide-react';

function getRoleCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(^| )user_role=([^;]+)/);
    return match ? match[2] : null;
}

export default function VendorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, initializing, isAuthenticated } = useAuth();
    const router = useRouter();
    // Use cookie as an instant signal that user is authenticated
    const [hasRoleCookie] = useState(() => !!getRoleCookie());

    useEffect(() => {
        if (!initializing && !isAuthenticated && !hasRoleCookie) {
            router.push('/login');
        }
    }, [initializing, isAuthenticated, hasRoleCookie, router]);

    // Show loading ONLY if we have no signal at all (no cookie AND no user data yet)
    if (!hasRoleCookie && (initializing || !user)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && !hasRoleCookie) return null;

    return (
        <div className="flex min-h-screen bg-muted/30">
            <VendorSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
