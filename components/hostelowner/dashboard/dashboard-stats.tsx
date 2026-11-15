"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./stats-card";
import { useState, useMemo } from "react";
import { ChevronDown, Layers, Building2, Hotel, Home } from "lucide-react";

export interface StreamStatData {
    total: number;
    cancelled: number;
    confirmed: number;
    properties: number;
    rooms: number;
    revenue: number;
}

interface DashboardStatsResponse {
    total_hostels: number;
    total_rooms: number;
    active_bookings: number;
    total_bookings: number;
    cancelled_bookings: number;
    revenue: number;
    streams?: Record<string, StreamStatData>;
}

type StreamTab = "all" | "hostel" | "hotel" | "vacation_rental";

export default function DashboardStats() {
    const { user } = useAuth();
    const [selectedMetric, setSelectedMetric] = useState<"total" | "active" | "cancelled">("total");
    const [selectedStream, setSelectedStream] = useState<StreamTab>("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data, isLoading: queryLoading } = useQuery<DashboardStatsResponse>({
        queryKey: ["dashboardStats", user?.id],
        queryFn: () => authApiClient.get("/api/dashboard/stats/"),
        // Skip the id:-1 placeholder user that Providers seeds before the real user loads
        enabled: !!user?.id && user.id > 0,
        refetchInterval: 5000,
    });

    // Show the placeholder until data exists. Depending only on `data` keeps the
    // server render and the first client render identical (no hydration mismatch),
    // whatever the auth state happens to be when this component hydrates.
    const isLoading = queryLoading || !data;

    const formatRevenue = (value: number | undefined) => {
        if (value === undefined || value === null) return "0";
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        return `₹${value.toLocaleString("en-IN")}`;
    };

    // Current stream stats resolution
    const streamStats = useMemo(() => {
        const stream = data?.streams?.[selectedStream];
        return {
            total: stream?.total ?? data?.total_bookings ?? 0,
            cancelled: stream?.cancelled ?? data?.cancelled_bookings ?? 0,
            confirmed: stream?.confirmed ?? data?.active_bookings ?? 0,
            properties: stream?.properties ?? data?.total_hostels ?? 0,
            rooms: stream?.rooms ?? data?.total_rooms ?? 0,
            revenue: stream?.revenue ?? data?.revenue ?? 0,
        };
    }, [data, selectedStream]);

    const propertyLabel = useMemo(() => {
        switch (selectedStream) {
            case "hotel":
                return "Total Hotels";
            case "vacation_rental":
                return "Vacation Rentals";
            default:
                return "All Properties";
        }
    }, [selectedStream]);

    const roomsLabel = useMemo(() => {
        switch (selectedStream) {
            case "vacation_rental":
                return "Rental Units";
            case "hotel":
                return "Hotel Rooms";
            default:
                return "Total Rooms";
        }
    }, [selectedStream]);

    const propertyIcon = useMemo(() => {
        switch (selectedStream) {
            case "hotel":
                return "🏨";
            case "vacation_rental":
                return "🏡";
            default:
                return "🏛️";
        }
    }, [selectedStream]);

    const metrics = {
        total: {
            label: "Total Bookings",
            value: streamStats.total.toString(),
            icon: "📊",
            notation: "(Confirmed + Completed + Pending)",
        },
        active: {
            label: "Active Bookings",
            value: streamStats.confirmed.toString(),
            icon: "📅",
            notation: "(Only confirmed bookings)",
        },
        cancelled: {
            label: "Cancelled",
            value: streamStats.cancelled.toString(),
            icon: "❌",
            notation: "(Revoked stays)",
        },
    };

    const currentMetric = metrics[selectedMetric];

    const handleSelect = (mode: "total" | "active" | "cancelled", e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMetric(mode);
        setIsDropdownOpen(false);
    };

    const streamTabs = [
        { id: "all" as StreamTab, label: "All Stats", icon: Layers },
        // { id: "hostel" as StreamTab, label: "Hostels", icon: Building2 },
        { id: "hotel" as StreamTab, label: "Hotels", icon: Hotel },
        { id: "vacation_rental" as StreamTab, label: "Vacation Rentals", icon: Home },
    ];

    return (
        <div className="space-y-3 sm:space-y-3.5">
            {/* Stream Category Filter Bar (Touch-friendly switcher with clean rectangular styling) */}
            <div className="flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth [-webkit-overflow-scrolling:touch] w-full sm:w-auto">
                    {streamTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = selectedStream === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedStream(tab.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-md text-xs font-semibold transition-all duration-200 shrink-0 select-none active:scale-95 ${
                                    isSelected
                                        ? "bg-[#1F1E1B] text-white shadow-xs border border-[#1F1E1B]"
                                        : "bg-[#DBD5C8]/80 text-[#5A544A] hover:text-[#1A1916] hover:bg-[#DBD5C8] border border-[#D2CABC]"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid gap-2.5 sm:gap-3.5 md:gap-4 grid-cols-2 lg:grid-cols-4">
                {/* Selector Card for Booking Stats */}
                <div className="bg-[#E5DFD4] p-3 sm:p-4 md:p-4 rounded-md shadow-xs border border-[#D2CABC] flex flex-col justify-between group hover:border-[#1F1E1B]/30 transition-all duration-200 relative">
                    <div className="flex justify-between items-start mb-1.5 gap-1">
                        <p className="text-[11px] sm:text-xs font-bold text-[#686259] uppercase tracking-wider truncate">
                            {currentMetric.label}
                        </p>

                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#1F1E1B] bg-[#DBD5C8] border border-[#D2CABC] px-2 py-0.5 rounded-md hover:bg-[#DBD5C8]/80 transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                            >
                                SWITCH{" "}
                                <ChevronDown
                                    size={11}
                                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-[40]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDropdownOpen(false);
                                        }}
                                    />
                                    <div className="absolute right-0 top-full mt-1 bg-[#E5DFD4] border border-[#D2CABC] rounded-md shadow-xl py-1 z-[50] min-w-[130px] animate-in fade-in slide-in-from-top-1">
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("total", e)}
                                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "total"
                                                    ? "text-[#1F1E1B] bg-[#DBD5C8] font-bold"
                                                    : "text-[#1A1916] hover:bg-[#DBD5C8]/50"
                                            }`}
                                        >
                                            Total Bookings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("active", e)}
                                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "active"
                                                    ? "text-[#1F1E1B] bg-[#DBD5C8] font-bold"
                                                    : "text-[#1A1916] hover:bg-[#DBD5C8]/50"
                                            }`}
                                        >
                                            Active Bookings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("cancelled", e)}
                                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "cancelled"
                                                    ? "text-[#1F1E1B] bg-[#DBD5C8] font-bold"
                                                    : "text-[#1A1916] hover:bg-[#DBD5C8]/50"
                                            }`}
                                        >
                                            Cancelled
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1.5">
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-[22px] font-extrabold text-[#1A1916] tracking-tight group-hover:text-[#1F1E1B] transition-colors truncate">
                                {isLoading ? "..." : currentMetric.value}
                            </h2>
                            <p className="text-[10px] sm:text-[11px] font-medium text-[#686259] mt-0.5 italic leading-tight truncate">
                                {currentMetric.notation}
                            </p>
                        </div>
                        <div className="text-xl sm:text-2xl bg-[#DBD5C8] group-hover:bg-[#1F1E1B]/10 w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-[#1F1E1B]/20 shrink-0">
                            {currentMetric.icon}
                        </div>
                    </div>
                </div>

                <StatsCard
                    title="Revenue"
                    value={isLoading ? "..." : formatRevenue(streamStats.revenue)}
                    icon="💰"
                />
                <StatsCard
                    title={propertyLabel}
                    value={isLoading ? "..." : (streamStats.properties ?? 0).toString()}
                    icon={propertyIcon}
                />
                <StatsCard
                    title={roomsLabel}
                    value={isLoading ? "..." : (streamStats.rooms ?? 0).toString()}
                    icon="🛏️"
                />
            </div>
        </div>
    );
}
