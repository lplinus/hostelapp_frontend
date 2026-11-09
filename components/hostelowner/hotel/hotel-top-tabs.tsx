"use client";

import { Building2, BedDouble, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "./hotel-management-types";

interface HotelTopTabsProps {
    activeTab: TabType;
    handleTabChange: (tab: TabType) => void;
    hotelsCount: number;
    totalRoomsCount: number;
    hotelBookingsCount: number;
    isMounted: boolean;
}

export function HotelTopTabs({ activeTab, handleTabChange, hotelsCount, totalRoomsCount, hotelBookingsCount, isMounted }: HotelTopTabsProps) {
    return (
        <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6">
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/80 shadow-2xs">
                <button type="button" onClick={() => handleTabChange("properties")}
                    className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                        activeTab === "properties" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                    <Building2 size={15} className={activeTab === "properties" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                    <span>Hotel Properties</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors",
                        activeTab === "properties" ? "bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>
                        {isMounted ? hotelsCount : 0}
                    </span>
                </button>

                <button type="button" onClick={() => handleTabChange("rooms")}
                    className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                        activeTab === "rooms" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                    <BedDouble size={15} className={activeTab === "rooms" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                    <span>Rooms & Units</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors",
                        activeTab === "rooms" ? "bg-[#312E81] text-white" : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>
                        {isMounted ? totalRoomsCount : 0}
                    </span>
                </button>

                <button type="button" onClick={() => handleTabChange("bookings")}
                    className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                        activeTab === "bookings" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                    <Calendar size={15} className={activeTab === "bookings" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                    <span>Hotel Bookings</span>
                    {hotelBookingsCount > 0 && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors",
                            activeTab === "bookings" ? "bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" : "bg-indigo-100 dark:bg-indigo-950 text-[#312E81] dark:text-indigo-300")}>
                            {hotelBookingsCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

