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
            case "hostel":
                return "Total Hostels";
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
            case "hostel":
                return "Hostel Rooms";
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
            case "hostel":
                return "🏢";
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
        { id: "hostel" as StreamTab, label: "Hostels", icon: Building2 },
        { id: "hotel" as StreamTab, label: "Hotels", icon: Hotel },
        { id: "vacation_rental" as StreamTab, label: "Vacation Rentals", icon: Home },
    ];

    return (
        <div className="space-y-4">
            {/* Stream Category Filter Bar (Matching application soft-corner buttons) */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {streamTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = selectedStream === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedStream(tab.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    isSelected
                                        ? "bg-white text-blue-600 shadow-xs border border-blue-200"
                                        : "bg-white/60 text-slate-500 hover:text-slate-800 hover:bg-white border border-border/60"
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Selector Card for Booking Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex flex-col justify-between group hover:border-primary/30 transition-all duration-200 relative">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {currentMetric.label}
                        </p>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md hover:bg-primary/15 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                SWITCH{" "}
                                <ChevronDown
                                    size={10}
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
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-xl py-1 z-[50] min-w-[130px] animate-in fade-in slide-in-from-top-1">
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("total", e)}
                                            className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "total"
                                                    ? "text-primary bg-primary/10"
                                                    : "text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            Total Bookings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("active", e)}
                                            className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "active"
                                                    ? "text-primary bg-primary/10"
                                                    : "text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            Active Bookings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("cancelled", e)}
                                            className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "cancelled"
                                                    ? "text-primary bg-primary/10"
                                                    : "text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            Cancelled
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                {isLoading ? "..." : currentMetric.value}
                            </h2>
                            <p className="text-[10px] font-medium text-muted-foreground mt-1 italic leading-tight">
                                {currentMetric.notation}
                            </p>
                        </div>
                        <div className="text-3xl bg-muted/40 group-hover:bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-primary/20">
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
