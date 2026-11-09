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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Hotels Managed</p>
                        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{isMounted ? hotelsCount : 0}</p>
                        <p className="text-[11px] text-muted-foreground">Properties registered</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><HotelIcon size={18} /></div>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Room Inventory</p>
                        <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">{isMounted ? totalRoomsCount : 0}</p>
                        <p className="text-[11px] text-muted-foreground">Suites & rooms across all hotels</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"><BedDouble size={18} /></div>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Active Listings</p>
                        <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">{isMounted ? activeCount : 0}</p>
                        <p className="text-[11px] text-muted-foreground">Ready for online reservations</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle2 size={18} /></div>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Booking Dashboard</p>
                        <Link href="/hotelbooking" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1">
                            View Reservations <ChevronRight size={13} />
                        </Link>
                        <p className="text-[11px] text-muted-foreground">Check-ins & daily folios</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Layers size={18} /></div>
                </CardContent>
            </Card>
        </div>
    );
}

