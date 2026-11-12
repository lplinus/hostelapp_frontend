"use client";

import { useMemo } from "react";
import { BedDouble, Building2, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GroupedHostelRooms } from "@/services/hostelservices/room.service";

interface HostelRoomKpisProps {
    groupedRooms?: GroupedHostelRooms[];
    totalHostels: number;
}

export default function HostelRoomKpis({ groupedRooms, totalHostels }: HostelRoomKpisProps) {
    const stats = useMemo(() => {
        let totalVariants = 0;
        let totalBeds = 0;
        let availableBeds = 0;
        let activeVariants = 0;

        if (groupedRooms) {
            groupedRooms.forEach((h) => {
                h.categories.forEach((cat) => {
                    cat.rooms?.forEach((r) => {
                        totalVariants += 1;
                        if (r.is_available) activeVariants += 1;
                        if (r.total_beds) totalBeds += Number(r.total_beds);
                        if (r.available_beds) availableBeds += Number(r.available_beds);
                    });
                });
            });
        }

        return { totalVariants, totalBeds, availableBeds, activeVariants };
    }, [groupedRooms]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Hostels</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums tracking-tight leading-none">{totalHostels}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Registered</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Variants</p>
                        <p className="text-lg sm:text-xl font-bold text-[#312E81] dark:text-indigo-400 tabular-nums tracking-tight leading-none">{stats.totalVariants}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">All sharing types</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-[#312E81] dark:text-indigo-300 flex items-center justify-center shrink-0">
                        <BedDouble size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Bed Capacity</p>
                        <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight leading-none">
                            {stats.availableBeds} <span className="text-xs font-semibold text-muted-foreground">/ {stats.totalBeds || "—"}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Available / total</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Users size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Active</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums tracking-tight leading-none">{stats.activeVariants}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Live variants</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={15} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
