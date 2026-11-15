import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardStats from "@/components/hostelowner/dashboard/dashboard-stats";
import RecentBookings from "@/components/hostelowner/dashboard/recent-bookings";
import QuickActions from "@/components/hostelowner/dashboard/quick-actions";
import BookingChartWrapper from "@/components/hostelowner/dashboard/booking-chart-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Hostel In - Hostel Booking Platform",
    description:
        "Manage your hostel bookings, view stats, and take quick actions from your Hostel In dashboard.",
};

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-[#EDE8DF]/40">
            <DashboardSidebar />

            <main className="flex-1 p-3 sm:p-4 md:p-5 space-y-3.5 sm:space-y-4 md:space-y-4.5 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />

                <div className="flex-1 max-w-[1360px] w-full mx-auto space-y-3.5 sm:space-y-4 md:space-y-4.5">
                    {/* Title Section (Desktop only - on mobile the header and dock handle title) */}
                    <div className="hidden md:block space-y-0.5">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h2>
                        <p className="text-xs text-muted-foreground">
                            Overview of your property activity and performance.
                        </p>
                    </div>

                    {/* Stats */}
                    <DashboardStats />

                    {/* Analytical Chart */}
                    <div className="grid gap-3 sm:gap-4 md:gap-4.5">
                        <BookingChartWrapper />
                    </div>

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4.5">
                        <div className="lg:col-span-2">
                            <RecentBookings />
                        </div>

                        <QuickActions />
                    </div>
                </div>
            </main>
        </div>
    );
}