import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardStats from "@/components/user/dashboard/dashboard-stats";
import RecentBookings from "@/components/user/dashboard/recent-bookings";
import QuickActions from "@/components/user/dashboard/quick-actions";
import BookingChartWrapper from "../../../components/user/dashboard/booking-chart-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | StayNest - Hostel Booking Platform",
    description:
        "Manage your hostel bookings, view stats, and take quick actions from your StayNest dashboard.",
};

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

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
            </main>
        </div>
    );
}