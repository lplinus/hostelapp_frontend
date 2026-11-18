import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import AdSenseOverview from "@/components/hostelowner/adsence/adsense-overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sponsored Ads & Promotions | Hostel In Owner",
    description: "Promote your hotel and vacation rental listings with in-house sponsored placements and native display banners.",
};

export default function AdSensePage() {
    return (
        <div className="flex min-h-screen bg-muted/30 dark:bg-slate-950 text-foreground transition-colors">
            <DashboardSidebar />

            <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />

                <div className="flex-1 w-full space-y-6">
                    <AdSenseOverview />
                </div>
            </main>
        </div>
    );
}


