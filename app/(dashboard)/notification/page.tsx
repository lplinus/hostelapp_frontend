import NotificationList from "@/components/hostelowner/notification/NotificationList";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";

export const metadata = {
  title: "Notifications | Dashboard",
  description: "View your recent notifications and alerts.",
};

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar />
      <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6 min-w-0">
        <DashboardHeader />
        <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
          <NotificationList />
        </div>
      </main>
    </div>
  );
}
