"use client";

import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import { HostelBookingModule } from "@/components/hostelowner/hostel/hostelbookings";

export default function BookingsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <HostelBookingModule />
            </main>
        </div>
    );
}
