import type { Metadata } from "next";
import { Suspense } from "react";
import GuestSidebar from "@/components/home/guestprofile/guest-sidebar";
import GuestProfileContainer from "@/components/home/guestprofile/dashboard/guest-profile-container";

export const metadata: Metadata = {
    title: "Guest Profile | Stay & Travel Account",
    description: "Manage your guest details, verified identity, contact information, and travel bookings.",
};

export default function GuestProfilePage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <Suspense fallback={null}>
                <GuestSidebar />
            </Suspense>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
                <div className="w-full space-y-6">
                    <Suspense fallback={null}>
                        <GuestProfileContainer />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

