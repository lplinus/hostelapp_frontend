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
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated on bookings, orders, and system alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
            {unreadCount > 0 && (
            <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary hover:underline transition-colors flex items-center gap-1.5"
            >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark all read
            </button>
            )}
            {notifications.length > 0 && (
               <button
                 onClick={handleClearAll}
                 className="text-xs font-semibold text-destructive hover:underline transition-colors flex items-center gap-1.5 ml-2"
               >
                  <Trash2 className="w-3.5 h-3.5"/>
                  Clear all
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
          <div className="grid gap-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative group overflow-hidden rounded-xl border transition-all duration-200 ${
                  notification.is_read
                    ? "bg-card border-border/40 opacity-75"
                    : `bg-card border-primary/20 shadow-xs`
                }`}
              >
                {!notification.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                <div className="p-4 flex items-start gap-3.5">
                  {/* Icon Area */}
                  <div
                    className="flex-shrink-0 w-10 h-10 bg-muted/60 flex items-center justify-center rounded-xl border border-border/40"
                  >
                    {iconMap[notification.notification_type || "system"]}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          notification.is_read
                            ? "text-muted-foreground font-medium"
                            : "text-foreground font-bold"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1 inline" />
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {notification.message}
                    </p>

                    {/* Action Area */}
                    <div className="mt-auto flex items-center gap-3 pt-2 border-t border-border/40">
                      <Link
                          href={getLinkForNotification(notification.notification_type)}
                          onClick={() => handleDetailsClick(notification)}
                          className="flex items-center gap-1 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-xs transition-all px-3 py-1.5 rounded-lg"
                        >
                          View Details <ExternalLink className="w-3 h-3 ml-0.5" />
                      </Link>

                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-lg"
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
