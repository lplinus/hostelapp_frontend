import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import SubscriptionClient from "@/components/user/subscription/subscription-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Subscription | StayNest - Upgrade Your Plan",
    description:
        "Manage your subscription and upgrade to premium plans to unlock more features for your hostel.",
};

export default function SubscriptionPage() {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <DashboardSidebar />

            <main className="flex-1 p-4 md:p-8 space-y-8">
                <DashboardHeader />

                <div className="max-w-[1200px] mx-auto">
                    <SubscriptionClient />
                </div>
            </main>
        </div>
    );
}
