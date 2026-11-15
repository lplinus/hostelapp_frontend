import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import VacationRentalDashboard from "@/components/hostelowner/vacationrental/vacatrentalbooking/vacation-rental-dashboard";

export const metadata: Metadata = {
    title: "Vacation Rental Bookings | Owner Panel",
    description: "Manage vacation rental reservations, guest bookings, and host approvals.",
};

export default function VacationRentalBookingPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto">
                    <Suspense fallback={null}>
                        <VacationRentalDashboard />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
