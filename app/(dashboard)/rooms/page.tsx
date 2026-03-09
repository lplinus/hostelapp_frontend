import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import RoomsContainer from "@/components/user/rooms/rooms-container";
import { getGroupedRoomsServer } from "@/lib/api/server-rooms";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Rooms | StayNest Dashboard",
    description: "Structure and manage your hostel room variants, pricing, and availability.",
};

export default async function RoomsPage() {
    // Fetch initial data on the server for speed and SEO
    const initialGroupedRooms = await getGroupedRoomsServer();

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <DashboardSidebar />

            <main className="flex-1 p-4 md:p-8 lg:p-10 space-y-8 overflow-y-auto">
                <DashboardHeader />

                {/* Rooms Container handles the logic and grouped display */}
                <RoomsContainer initialGroupedRooms={initialGroupedRooms} />
            </main>
        </div>
    );
}
