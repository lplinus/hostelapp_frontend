"use client";

import React, { useState } from "react";
import {
    CalendarDays,
    Building2,
    Hotel,
    Home,
    MapPin,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GuestTripSummary } from "../guest-profile-types";

interface GuestBookingsListProps {
    bookings: GuestTripSummary[];
}

export default function GuestBookingsList({ bookings }: GuestBookingsListProps) {
    const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "completed">("all");

    const filteredBookings = bookings.filter((b) => {
        if (filter === "all") return true;
        if (filter === "upcoming") return b.status === "upcoming" || b.status === "confirmed";
        if (filter === "active") return b.status === "active";
        if (filter === "completed") return b.status === "completed";
        return true;
    });

    const getPropertyIcon = (type: GuestTripSummary["propertyType"]) => {
        switch (type) {
            case "hotel":
                return <Hotel className="w-3.5 h-3.5 text-blue-600" />;
            case "vacation_rental":
                return <Home className="w-3.5 h-3.5 text-amber-600" />;
            default:
                return <Building2 className="w-3.5 h-3.5 text-emerald-600" />;
        }
    };

    const getStatusBadge = (status: GuestTripSummary["status"]) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 gap-1 text-[10px] font-medium">
                        <CheckCircle2 size={11} /> Checked In
                    </Badge>
                );
            case "upcoming":
            case "confirmed":
                return (
                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 gap-1 text-[10px] font-medium">
                        <Clock size={11} /> Confirmed
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px]">
                        Completed
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                        <XCircle size={11} /> Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <div>
                        <h2 className="text-sm font-semibold text-foreground tracking-tight">
                            My Stays & Bookings
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage all hostel, hotel, and vacation rental reservations.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md text-xs">
                    {(["all", "upcoming", "active", "completed"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                                filter === tab
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                    No bookings found matching this filter.
                </div>
            ) : (
                <div className="divide-y divide-border/60">
                    {filteredBookings.map((b) => (
                        <div
                            key={b.id}
                            className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-muted/80">{getPropertyIcon(b.propertyType)}</div>
                                    <h3 className="text-xs font-semibold text-foreground">
                                        {b.propertyName}
                                    </h3>
                                    {getStatusBadge(b.status)}
                                </div>

                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                                    <span>Ref: <strong className="font-mono text-foreground">{b.bookingRef}</strong></span>
                                    <span>•</span>
                                    <span>{b.roomTitle || "Standard"}</span>
                                    <span>•</span>
                                    <span>{b.checkIn} to {b.checkOut}</span>
                                    {b.location && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-0.5">
                                                <MapPin size={11} /> {b.location}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center">
                                <span className="text-xs font-semibold text-foreground">
                                    ₹{b.totalAmount.toLocaleString()}
                                </span>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2.5">
                                    Details <ArrowUpRight size={11} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

