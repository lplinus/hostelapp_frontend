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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            {perspective === "guest" ? "Total Trips" : "Total Requests"}
                        </p>
                        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                            {totalCount}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Vacation reservations</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Palmtree size={18} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Confirmed Stays</p>
                        <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {upcomingCount}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Upcoming locked dates</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCheck size={18} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Pending Approval</p>
                        <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                            {pendingCount}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            {perspective === "guest" ? "Awaiting host" : "Action required"}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock size={18} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            {perspective === "guest" ? "Total Vacation Spend" : "Host Revenue"}
                        </p>
                        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                            {formatCurrency(totalRevenueSum)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Total booking value</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CreditCard size={18} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

