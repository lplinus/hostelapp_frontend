import type { Metadata } from "next";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import MyDocumentsClient from "@/components/hostelowner/mydocuments/my-documents-client";

export const metadata: Metadata = {
    title: "My Documents & Verification | Hostel In Owner",
    description: "Upload and manage business and property documents for Super Admin verification.",
};

export default function MyDocumentsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30 dark:bg-slate-950 text-foreground transition-colors">
            <DashboardSidebar />

            <main className="flex-1 p-3 sm:p-4 md:p-5 space-y-3.5 sm:space-y-4 md:space-y-4.5 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />

                <div className="flex-1 w-full space-y-3.5 sm:space-y-4 md:space-y-4.5">
                    <MyDocumentsClient />
                </div>
            </main>
        </div>
    );
}
