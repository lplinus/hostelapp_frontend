"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { Booking } from "@/services/booking.service";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { cn } from "@/lib/utils";

function BookingIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            className={className}
        >
            <title>booking</title>
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.75 18.75V5.25a2.5 2.5 0 0 1 2.5-2.5h10a2 2 0 0 1 2 2v11.5H6.75a2 2 0 0 0-2 2Zm0 0a2.5 2.5 0 0 0 2.5 2.5h12v-4.5m-10-9.5h5.5"
            />
        </svg>
    );
}

export default function RecentBookings() {
    const { user } = useAuth();
    const { data: bookings, isLoading: queryLoading } = useQuery<Booking[]>({
        queryKey: ["recentBookings", user?.id],
        queryFn: () => authApiClient.get("/api/bookings/"),
        enabled: !!user?.id && user.id > 0,
        refetchInterval: 5000,
    });
    // Depend only on data so server and first client render match (no hydration mismatch)
    const isLoading = queryLoading || !bookings;

    const recentBookings = [...(bookings || [])]
        .sort((a, b) => new Date(b.created_at ?? b.check_in).getTime() - new Date(a.created_at ?? a.check_in).getTime())
        .slice(0, 3);

    return (
        <div className="bg-[#E5DFD4] dark:bg-slate-900 p-3 sm:p-4 md:p-4.5 rounded-md shadow-xs border border-[#D2CABC] dark:border-slate-800 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[#1A1916] dark:text-slate-100">Recent Bookings</h3>
                <Link href="/hotel?tab=bookings" className="text-xs font-bold text-[#1F1E1B] dark:text-slate-200 hover:underline transition-colors">
                    View All
                </Link>
            </div>

            <div className="space-y-2 sm:space-y-2.5 flex-1">
                {isLoading && (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 bg-[#DBD5C8] dark:bg-slate-800 rounded-md animate-pulse" />
                        ))}
                    </div>
                )}
                {!isLoading && recentBookings.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6">
                        <div className="w-10 h-10 bg-[#DBD5C8] dark:bg-slate-800 text-[#1F1E1B] dark:text-slate-200 rounded-md flex items-center justify-center mb-2">
                            <BookingIcon className="w-5 h-5 text-current" />
                        </div>
                        <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400 font-medium">No recent bookings</p>
                    </div>
                )}
                {!isLoading && recentBookings.length > 0 && recentBookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="flex justify-between items-center group p-2.5 sm:p-3 rounded-md hover:bg-[#DBD5C8]/60 dark:hover:bg-slate-800/60 transition-all border border-[#D2CABC]/60 dark:border-slate-800 hover:border-[#D2CABC] dark:hover:border-slate-700"
                    >
                        <div className="min-w-0 pr-2">
                            <p className="font-bold text-xs sm:text-sm text-[#1A1916] dark:text-slate-100 truncate">
                                {booking.guest_name || "Guest User"}
                            </p>
                            <p className="text-[11px] sm:text-xs text-[#686259] dark:text-slate-400 truncate mt-0.5">
                                {booking.hostel_name || (booking.hostel ? `Reservation #${booking.hostel}` : "Direct Reservation")}
                            </p>
                            <div className="mt-1">
                                <span className={cn(
                                    "text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider",
                                    booking.booking_type === "visit"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                                        : "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
                                )}>
                                    {booking.booking_type}
                                </span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <p className="text-[10px] sm:text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                {booking.status}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-[#686259] dark:text-slate-400 mt-0.5 font-semibold">
                                {new Date(booking.check_in).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
