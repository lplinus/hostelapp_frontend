"use client";

import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import { HostelBookingModule } from "@/components/hostelowner/hostel/hostelbookings";

export default function BookingsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />
                <HostelBookingModule />
            </main>
        </div>
    );
}
