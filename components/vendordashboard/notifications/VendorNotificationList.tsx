"use client";

import React, { useEffect, useState } from "react";
import { 
  VendorNotification, 
  getVendorNotifications, 
  markAllVendorAsRead, 
  markVendorAsRead, 
  clearAllVendorNotifications 
} from "@/services/vendor-notification.service";
import { Bell, CheckCircle, Package, CreditCard, Info, Clock, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const iconMap = {
  order: <Package className="w-5 h-5 text-blue-600" />,
  payment: <CreditCard className="w-5 h-5 text-emerald-600" />,
  product: <Package className="w-5 h-5 text-indigo-600" />,
  system: <Info className="w-5 h-5 text-gray-600" />,
};

const bgMap = {
  order: "bg-blue-50/50 border-blue-100",
  payment: "bg-emerald-50/50 border-emerald-100",
  product: "bg-indigo-50/50 border-indigo-100",
  system: "bg-gray-50/50 border-gray-100",
};

export default function VendorNotificationList() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await getVendorNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch vendor notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markVendorAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllVendorAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllVendorNotifications();
      setNotifications([]);
      toast.success("Notifications cleared");
    } catch (error) {
       toast.error("Failed to clear notifications");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            Vendor Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time updates on your orders and business activity.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {unreadCount > 0 && (
                <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                >
                    <CheckCircle size={14} />
                    Mark all read
                </button>
            )}
            {notifications.length > 0 && (
                <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1.5 ml-4"
                >
                    <Trash2 size={14} />
                    Clear all
                </button>
            )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Bell className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">We'll notify you here when you receive new orders or updates.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                !notification.is_read 
                  ? `${bgMap[notification.notification_type] || "bg-card"} shadow-sm` 
                  : "bg-background opacity-70"
              }`}
            >
              <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border bg-white shadow-sm`}>
                {iconMap[notification.notification_type] || <Bell size={18} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold truncate ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                    {notification.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4">
                  {notification.notification_type === 'order' && (
                    <Link
                      href="/vendordashboard/orders"
                      onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                      className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      View Order <ExternalLink size={10} />
                    </Link>
                  )}
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground ml-auto"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
