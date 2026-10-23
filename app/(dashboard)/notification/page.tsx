import NotificationList from "@/components/user/notification/NotificationList";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";

export const metadata = {
  title: "Notifications | Dashboard",
  description: "View your recent notifications and alerts.",
};

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar />
      <main className="flex-1 p-6 space-y-6">
        <DashboardHeader />
        <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
          <NotificationList />
        </div>
      </main>
    </div>
  );
}
