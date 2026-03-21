
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
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <HelpSupportContent />
            </main>
        </div>
    );
}