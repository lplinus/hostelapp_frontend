"use client";

import React from "react";
import { Compass, Calendar, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GuestProfile } from "../guest-profile-types";

interface GuestProfileStatsProps {
    stats?: GuestProfile["stats"];
}

export default function GuestProfileStats({ stats }: GuestProfileStatsProps) {
    const s = stats || {
        totalTrips: 0,
        completedStays: 0,
        reviewsCount: 0,
        memberSince: "2024",
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Trips</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">
                            {s.totalTrips}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">All-time bookings</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Compass size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Completed</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                            {s.completedStays}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Stays concluded</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Calendar size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Reviews Given</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums leading-none">
                            {s.reviewsCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Community ratings</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Star size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Member Tier</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-[#312E81] dark:text-indigo-400 leading-none">
                            Explorer
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Since {s.memberSince}</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-[#312E81] dark:text-indigo-300 flex items-center justify-center shrink-0">
                        <Award size={15} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

