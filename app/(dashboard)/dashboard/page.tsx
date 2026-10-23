import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardStats from "@/components/user/dashboard/dashboard-stats";
import RecentBookings from "@/components/user/dashboard/recent-bookings";
import QuickActions from "@/components/user/dashboard/quick-actions";
import BookingChartWrapper from "@/components/user/dashboard/booking-chart-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Hostel In - Hostel Booking Platform",
    description:
        "Manage your hostel bookings, view stats, and take quick actions from your Hostel In dashboard.",
};

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    {/* Title Section matching the sample template */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
                        <p className="text-sm text-muted-foreground">
                            Overview of your hostel activity and performance.
                        </p>
                    </div>

                    {/* Stats */}
                    <DashboardStats />

                    {/* Analytical Chart */}
                    <div className="grid gap-6">
                        <BookingChartWrapper />
                    </div>

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-3 gap-6">
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