import { Suspense } from "react";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import RoomsContainer from "@/components/hostelowner/rooms/rooms-container";
import { getGroupedRoomsServer } from "@/lib/api/server-rooms";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Rooms | Hostel In Dashboard",
    description: "Structure and manage your hostel room variants, pricing, and availability.",
};

function RoomsInnerLoader() {
    return (
        <div className="space-y-6 pb-12 font-sans">
            {/* Top Bar Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-xs border border-border">
                <div className="space-y-1.5">
                    <div className="h-7 w-48 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-72 bg-muted/60 animate-pulse rounded-md" />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-10 w-[160px] bg-muted/60 animate-pulse rounded-lg" />
                    <div className="h-10 w-28 bg-muted/60 animate-pulse rounded-lg" />
                </div>
            </div>

            {/* Inner Content Loader */}
            <div className="flex flex-col items-center justify-center min-h-[45vh] bg-white rounded-xl border border-border p-12 shadow-xs">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    <p className="text-sm text-muted-foreground font-medium">Loading rooms...</p>
                </div>
            </div>
        </div>
    );
}

async function RoomsContent() {
    const initialGroupedRooms = await getGroupedRoomsServer();
    return <RoomsContainer initialGroupedRooms={initialGroupedRooms} />;
}

export default function RoomsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <Suspense fallback={<RoomsInnerLoader />}>
                        <RoomsContent />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
