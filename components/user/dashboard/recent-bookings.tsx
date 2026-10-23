"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { Booking } from "@/services/booking.service";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RecentBookings() {
    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ["recentBookings"],
        queryFn: () => authApiClient.get("/api/bookings/"),
        refetchInterval: 5000,
    });

    const recentBookings = [...(bookings || [])]
        .sort((a, b) => new Date(b.created_at ?? b.check_in).getTime() - new Date(a.created_at ?? a.check_in).getTime())
        .slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-base text-foreground">Recent Bookings</h3>
                <Link href="/bookings" className="text-xs font-semibold text-primary hover:underline transition-colors">
                    View All
                </Link>
            </div>

            <div className="space-y-3 flex-1">
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}
                {!isLoading && recentBookings.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                            <span className="text-2xl">📅</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No recent bookings</p>
                    </div>
                )}
                {!isLoading && recentBookings.length > 0 && recentBookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="flex justify-between items-center group p-3.5 rounded-xl hover:bg-muted/40 transition-all border border-border/60 hover:border-border"
                    >
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                                {booking.guest_name || "Guest User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {booking.hostel_name || `Hostel ID: ${booking.hostel}`}
                            </p>
                            <div className="mt-1.5">
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                                    booking.booking_type === "visit" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-purple-50 text-purple-700 border border-purple-200"
                                )}>
                                    {booking.booking_type}
                                </span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md uppercase tracking-wider">
                                {booking.status}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                {new Date(booking.check_in).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}