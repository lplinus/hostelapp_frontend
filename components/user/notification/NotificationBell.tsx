"use client";

import React, { useEffect, useState, useRef } from "react";
import { getUnreadCount, getNotifications, markAsRead, clearAllNotifications, AppNotification } from "@/services/notification.service";
import { Bell, CheckCircle, Package, Home, Calendar, Info, X, Trash2, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { usePathname } from "next/navigation";
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

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [showAll, setShowAll] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ensure polling only runs if the user is authenticated
  useEffect(() => {
    if (!user) return;
    fetchCount();
    const intervalId = setInterval(() => {
      fetchCount(true);
    }, 30000); // Check every 30s
    return () => clearInterval(intervalId);
  }, [user]);

  const fetchCount = async (isPolling = false) => {
    try {
      const data = await getUnreadCount();
      if (isPolling && data.unread_count > unreadCount && unreadCount !== 0) {
        toast("🔔 You have new notifications!");
      }
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Failed to fetch notification count");
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      // Safely check if data is an array just in case there's an API config drift
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen && user) {
      setShowAll(false);
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark read");
    }
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
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
      setIsOpen(false);
      if (!notif.is_read) markAsRead(notif.id);
      
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

  if (!user) return null; // Only render if user exists
  
  const visibleNotifications = showAll ? notifications : notifications.slice(0, 4);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-lg transition-colors flex items-center justify-center group ${
          isOpen ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Bell className={`w-5 h-5 group-hover:scale-110 transition-transform ${isOpen ? "fill-indigo-100" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-red-500 border-2 border-white rounded-full animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div>
              <h3 className="font-semibold text-gray-900 group flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                   <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                     {unreadCount} New
                   </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                 onClick={handleClearAll} 
                 className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1 group"
                 title="Clear All"
              >
                 <Trash2 className="w-4 h-4 group-hover:scale-105" />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                 <X className="w-4 h-4"/>
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                <Bell className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              visibleNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    !notif.is_read 
                       ? `bg-white ${bgMap[notif.notification_type || "system"]} shadow-sm` 
                       : "bg-gray-50/50 border-gray-100 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border bg-white ${bgMap[notif.notification_type || "system"]}`}>
                      {iconMap[notif.notification_type || "system"]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm truncate pr-2 ${!notif.is_read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {notif.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>

                        <div className="flex items-center gap-3">
                            <Link 
                              href={getLinkForNotification(notif.notification_type)}
                              onClick={() => handleDetailsClick(notif)}
                              className="text-[10px] flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Details <ExternalLink className="w-3 h-3" />
                            </Link>

                            {!notif.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                className="text-[10px] font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2"
                              >
                                Mark Read
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && !showAll && notifications.length > 4 && (
            <div className="p-3 border-t border-gray-100 bg-white sticky bottom-0">
              <button
                onClick={() => setShowAll(true)}
                className="flex items-center justify-center w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors border border-indigo-100"
              >
                View More &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
