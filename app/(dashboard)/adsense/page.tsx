import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import AdSenseOverview from "@/components/hostelowner/adsence/adsense-overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Google AdSense | Hostel In Dashboard",
    description: "Manage advertising monetization across your hostel and hotel listings.",
};

export default function AdSensePage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <AdSenseOverview />
                </div>
            </main>
        </div>
    );
}

