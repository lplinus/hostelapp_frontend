import NotificationList from "@/components/user/notification/NotificationList";

export const metadata = {
  title: "Notifications | Dashboard",
  description: "View your recent notifications and alerts.",
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NotificationList />
    </div>
  );
}
