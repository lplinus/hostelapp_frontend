"use client";

import Link from "next/link";
import { Hotel as HotelIcon, BedDouble, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HotelKpiCardsProps {
    hotelsCount: number;
    totalRoomsCount: number;
    activeCount: number;
    isMounted: boolean;
}

export function HotelKpiCards({ hotelsCount, totalRoomsCount, activeCount, isMounted }: HotelKpiCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Hotels Managed</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">{isMounted ? hotelsCount : 0}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Registered</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><HotelIcon size={15} /></div>
                </CardContent>
            </Card>
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Room Inventory</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">{isMounted ? totalRoomsCount : 0}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Suites & rooms</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"><BedDouble size={15} /></div>
                </CardContent>
            </Card>
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Active Listings</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums leading-none">{isMounted ? activeCount : 0}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Online reservations</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle2 size={15} /></div>
                </CardContent>
            </Card>
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Booking Dashboard</p>
                        <Link href="/hotelbooking" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-0.5">
                            View <ChevronRight size={12} />
                        </Link>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Check-ins & folios</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Layers size={15} /></div>
                </CardContent>
            </Card>
        </div>
    );
}

