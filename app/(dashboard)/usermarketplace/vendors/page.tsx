"use client";

import UserVendors from "@/components/user/usermarketplace/uservendors/uservendor";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import VendorSidebar from "@/components/vendordashboard/vendor-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
    const { user, initializing: authInitializing } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {authInitializing ? (
                <div className="w-72 bg-white border-r border-slate-200 hidden md:block" />
            ) : (
                user?.role === 'vendor' ? <VendorSidebar /> : <DashboardSidebar />
            )}
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <UserVendors />
            </main>
        </div>
    );
}
