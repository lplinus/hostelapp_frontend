import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import RoomsContainer from "@/components/user/rooms/rooms-container";
import { getGroupedRoomsServer } from "@/lib/api/server-rooms";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Rooms | Hostel In Dashboard",
    description: "Structure and manage your hostel room variants, pricing, and availability.",
};

export default async function RoomsPage() {
    // Fetch initial data on the server for speed and SEO
    const initialGroupedRooms = await getGroupedRoomsServer();

    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    {/* Rooms Container handles the logic and grouped display */}
                    <RoomsContainer initialGroupedRooms={initialGroupedRooms} />
                </div>
            </main>
        </div>
    );
}
