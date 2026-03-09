"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { Booking } from "@/services/booking.service";
import Link from "next/link";

export default function RecentBookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["recentBookings"],
    queryFn: () => authApiClient.get("/api/bookings/"),
  });

  const recentBookings = [...(bookings || [])]
    .sort((a, b) => new Date(b.created_at ?? b.check_in).getTime() - new Date(a.created_at ?? a.check_in).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-900">Recent Bookings</h3>
        <Link href="/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </Link>
      </div>

      <div className="space-y-4 flex-1">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && recentBookings.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">No recent bookings</p>
          </div>
        )}
        {!isLoading && recentBookings.length > 0 && recentBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex justify-between items-center group p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">
                {booking.guest_name || "Guest User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {booking.hostel_name || `Hostel ID: ${booking.hostel}`}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                {booking.status}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">
                {new Date(booking.check_in).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}