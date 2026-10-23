"use client";

import OnlineKirana from "@/components/user/usermarketplace/kirana/online-kirana";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import VendorSidebar from "@/components/vendordashboard/vendor-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
    const { user, initializing: authInitializing } = useAuth();

    return (
        <div className="flex min-h-screen bg-muted/30">
            {authInitializing ? (
                <div className="w-72 bg-white border-r border-slate-200 hidden md:block" />
            ) : (
                user?.role === 'vendor' ? <VendorSidebar /> : <DashboardSidebar />
            )}
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <OnlineKirana />
                </div>
            </main>
        </div>
    );
}
