import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import SubscriptionClient from "@/components/user/subscription/subscription-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Subscription | Hostel In - Upgrade Your Plan",
    description:
        "Manage your subscription and upgrade to premium plans to unlock more features for your hostel.",
};

export default function SubscriptionPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <SubscriptionClient />
                </div>
            </main>
        </div>
    );
}
