import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import AiAssistantChat from "@/components/hostelowner/Aiasistance/ai-assistance-chat";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Property Copilot | Hostel In Dashboard",
    description: "AI-powered property insights, pricing intelligence, and guest communication copilot.",
};

export default function AiAssistancePage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <AiAssistantChat />
                </div>
            </main>
        </div>
    );
}

