"use client";

import {
    Palmtree,
    Clock,
    CreditCard,
    CheckCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "./dashboard-types";

interface DashboardKpiCardsProps {
    perspective: "guest" | "host";
    totalCount: number;
    upcomingCount: number;
    pendingCount: number;
    totalRevenueSum: number;
}

export function DashboardKpiCards({
    perspective,
    totalCount,
    upcomingCount,
    pendingCount,
    totalRevenueSum,
}: DashboardKpiCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                            {perspective === "guest" ? "Total Trips" : "Total Requests"}
                        </p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">
                            {totalCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Reservations</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Palmtree size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Confirmed Stays</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                            {upcomingCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Locked dates</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCheck size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Pending Approval</p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums leading-none">
                            {pendingCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">
                            {perspective === "guest" ? "Awaiting host" : "Action required"}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock size={15} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                            {perspective === "guest" ? "Total Paid" : "Host Revenue"}
                        </p>
                        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">
                            {formatCurrency(totalRevenueSum)}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">Total value</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CreditCard size={15} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

