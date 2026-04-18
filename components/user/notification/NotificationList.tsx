"use client";

import React, { useEffect, useState } from "react";
import { AppNotification, getNotifications, markAllAsRead, markAsRead, clearAllNotifications } from "@/services/notification.service";
import { Bell, CheckCircle, Package, Home, Calendar, Info, Clock, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const iconMap = {
  booking: <Calendar className="w-5 h-5 text-blue-500" />,
  order: <Package className="w-5 h-5 text-purple-500" />,
  hostel: <Home className="w-5 h-5 text-emerald-500" />,
  room: <CheckCircle className="w-5 h-5 text-amber-500" />,
  system: <Info className="w-5 h-5 text-gray-500" />,
};

const bgMap = {
  booking: "bg-blue-50 border-blue-200",
  order: "bg-purple-50 border-purple-200",
  hostel: "bg-emerald-50 border-emerald-200",
  room: "bg-amber-50 border-amber-200",
  system: "bg-gray-50 border-gray-200",
};

export default function NotificationList() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
       toast.error("Failed to clear notifications");
    }
  };

  const getLinkForNotification = (type: string) => {
      if (type === 'order') {
          if (user?.role === 'vendor') {
              return '/vendordashboard/orders';
          } else {
              return '/usermarketplace/myorders';
          }
      }
      if (type === 'booking') return '/dashboard';
      if (type === 'hostel') return '/dashboard';
      return '/notification';
  };

  const handleDetailsClick = (notif: AppNotification) => {
      if (!notif.is_read) handleMarkAsRead(notif.id);
      
      // Invalidate relevant React Query caches to instantly reflect updates without manual refresh
      if (notif.notification_type === 'hostel') {
          queryClient.invalidateQueries({ queryKey: ["myHostels"] });
      } else if (notif.notification_type === 'order') {
          queryClient.invalidateQueries({ queryKey: ["vendorOrders"] });
          queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      } else if (notif.notification_type === 'booking') {
          queryClient.invalidateQueries({ queryKey: ["recentBookings"] });
          queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Stay updated on bookings, orders, and system alerts.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {unreadCount > 0 && (
            <button
                onClick={handleMarkAllAsRead}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-2 group"
            >
                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Mark read
            </button>
            )}
            {notifications.length > 0 && (
               <button
                 onClick={handleClearAll}
                 className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 group border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
               >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                  Clear All
               </button>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-full mb-4">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              You don&apos;t have any active notifications. As updates arrive, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  notification.is_read
                    ? "bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 opacity-80"
                    : `bg-white dark:bg-gray-900 ${bgMap[notification.notification_type || "system"]} shadow-[0_8px_30px_rgb(0,0,0,0.06)]`
                }`}
              >
                {!notification.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}

                <div className="p-5 flex items-start gap-5">
                  {/* Icon Area */}
                  <div
                    className={`flex-shrink-0 w-14 h-14 bg-white flex items-center justify-center rounded-2xl border shadow-sm ${
                      bgMap[notification.notification_type || "system"]
                    }`}
                  >
                    {iconMap[notification.notification_type || "system"]}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <h4
                        className={`text-lg font-bold truncate ${
                          notification.is_read
                            ? "text-gray-600 dark:text-gray-400 font-medium"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1.5 inline text-gray-500" />
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 pr-4">
                      {notification.message}
                    </p>

                    {/* Action Area */}
                    <div className="mt-auto flex items-center gap-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                      <Link
                          href={getLinkForNotification(notification.notification_type)}
                          onClick={() => handleDetailsClick(notification)}
                          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all px-4 py-2 rounded-lg group-hover:px-5 duration-300"
                        >
                          View Details <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>

                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-wider ml-auto bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
