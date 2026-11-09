"use client";

import {
    Palmtree,
    BedDouble,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTopTabsProps {
    localTab: "properties" | "rooms" | "bookings";
    handleTabChange: (tab: "properties" | "rooms" | "bookings") => void;
    myRentalsCount: number;
    hostedBookingsCount: number;
}

export function DashboardTopTabs({
    localTab,
    handleTabChange,
    myRentalsCount,
    hostedBookingsCount,
}: DashboardTopTabsProps) {
    return (
        <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6">
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/80 shadow-2xs">
                {/* 1. Vacation Properties */}
                <button
                    type="button"
                    onClick={() => handleTabChange("properties")}
                    className={cn(
                        "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                        localTab === "properties"
                            ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800"
                    )}
                >
                    <Palmtree size={15} className={localTab === "properties" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                    <span>Vacation Properties</span>
                    <span
                        className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors",
                            localTab === "properties"
                                ? "bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        )}
                    >
                        {myRentalsCount}
                    </span>
                </button>

                {/* 2. Rooms & Units */}
                <button
                    type="button"
                    onClick={() => handleTabChange("rooms")}
                    className={cn(
                        "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                        localTab === "rooms"
                            ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800"
                    )}
                >
                    <BedDouble size={15} className={localTab === "rooms" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                    <span>Rooms & Units</span>
                    <span
                        className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors",
                            localTab === "rooms"
                                ? "bg-[#312E81] text-white"
                                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        )}
                    >
                        {myRentalsCount}
                    </span>
                </button>

                {/* 3. Vacation Stays (Bookings) */}
                <button
                    type="button"
                    onClick={() => handleTabChange("bookings")}
                    className={cn(
                        "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                        localTab === "bookings"
                            ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800"
                    )}
                >
                    <Calendar size={15} className={localTab === "bookings" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                    <span>Vacation Stays (Bookings)</span>
                    {hostedBookingsCount > 0 && (
                        <span
                            className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors",
                                localTab === "bookings"
                                    ? "bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                    : "bg-indigo-100 dark:bg-indigo-950 text-[#312E81] dark:text-indigo-300"
                            )}
                        >
                            {hostedBookingsCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

