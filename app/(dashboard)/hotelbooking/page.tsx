import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import HotelBookingDashboard from "@/components/hostelowner/hotelbooking/hotel-booking-dashboard";

export const metadata: Metadata = {
    title: "Hotel Bookings | Owner Panel",
    description: "Manage hotel reservations, suites, stay schedules, and payment receipts.",
};

export default function HotelBookingPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto">
                    <Suspense fallback={null}>
                        <HotelBookingDashboard />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
