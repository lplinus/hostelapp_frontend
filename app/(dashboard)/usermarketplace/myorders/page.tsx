"use client";

import UserOrders from "@/components/hostelowner/marketplace/userorders/userorder";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import VendorSidebar from "@/components/vendordashboard/vendor-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import { useAuth } from "@/hooks/useAuth";

export default function MyOrdersPage() {
    const { user, initializing: authInitializing } = useAuth();

    return (
        <div className="flex min-h-screen bg-muted/30">
            {authInitializing ? (
                <div className="w-72 bg-white border-r border-slate-200 hidden md:block" />
            ) : (
                user?.role === 'vendor' ? <VendorSidebar /> : <DashboardSidebar />
            )}
            <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <UserOrders />
                </div>
            </main>
        </div>
    );
}
