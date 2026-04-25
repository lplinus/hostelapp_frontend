import VendorNotificationList from "@/components/vendordashboard/notifications/VendorNotificationList";

export const metadata = {
  title: "Vendor Notifications | Dashboard",
  description: "Manage your business notifications and order updates.",
};

export default function VendorNotificationsPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] w-full">
       <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
          <VendorNotificationList />
       </div>
    </div>
  );
}
