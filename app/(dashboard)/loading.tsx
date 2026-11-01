import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
