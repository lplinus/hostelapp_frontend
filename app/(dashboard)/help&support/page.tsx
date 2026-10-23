
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import HelpSupportContent from "@/components/user/help&support/help-support-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Help & Support | Hostel In Dashboard",
    description: "Get help with your bookings, account, or payments.",
};

export default function HelpSupportPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <HelpSupportContent />
                </div>
            </main>
        </div>
    );
}