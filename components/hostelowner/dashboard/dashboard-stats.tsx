"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./stats-card";
import { useState, useMemo } from "react";
import { ChevronDown, Hotel, Home, Calendar, XCircle } from "lucide-react";

export function ChartBoldIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
            <title>chart-bold</title>
            <path
                fill="currentColor"
                d="M20 13.75C20 13.3358 19.6642 13 19.25 13H16.25C15.8358 13 15.5 13.3358 15.5 13.75V20.5H14V4.25C14 3.52169 13.9984 3.05091 13.9518 2.70403C13.908 2.37872 13.8374 2.27676 13.7803 2.21967C13.7232 2.16258 13.6213 2.09197 13.296 2.04823C12.9491 2.00159 12.4783 2 11.75 2C11.0217 2 10.5509 2.00159 10.204 2.04823C9.87872 2.09197 9.77676 2.16258 9.71967 2.21967C9.66258 2.27676 9.59196 2.37872 9.54823 2.70403C9.50159 3.05091 9.5 3.52169 9.5 4.25V20.5H8V8.75C8 8.33579 7.66421 8 7.25 8H4.25C3.83579 8 3.5 8.33579 3.5 8.75V20.5H2H1.75C1.33579 20.5 1 20.8358 1 21.25C1 21.6642 1.33579 22 1.75 22H21.75C22.1642 22 22.5 21.6642 22.5 21.25C22.5 20.8358 22.1642 20.5 21.75 20.5H21.5H20V13.75Z"
            />
        </svg>
    );
}

export function IndianRupeeIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
            <title>indian-rupee</title>
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 2L18 2M6 7L18 7M15 2C15 5.9361 12.6333 9.4861 9 11L6 11L16 22"
            />
        </svg>
    );
}

export function BedIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
            <title>bed</title>
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"
            />
        </svg>
    );
}

export function HomeOutlineRoundedIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
            <title>home-outline-rounded</title>
            <path
                fill="currentColor"
                d="M6 19h3.692v-5.077q0-.343.233-.575q.232-.233.575-.233h3q.343 0 .576.233q.232.232.232.575V19H18v-8.692q0-.154-.067-.28t-.183-.22L12.366 5.75q-.154-.134-.366-.134t-.365.134L6.25 9.808q-.115.096-.183.22t-.067.28zm-1 0v-8.692q0-.384.172-.727t.474-.565l5.385-4.078q.423-.323.966-.323t.972.323l5.385 4.077q.303.222.474.566q.172.343.172.727V19q0 .402-.299.701T18 20h-3.884q-.344 0-.576-.232q-.232-.233-.232-.576v-5.076h-2.616v5.076q0 .344-.232.576T9.885 20H6q-.402 0-.701-.299T5 19m7-6.711"
            />
        </svg>
    );
}

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
                return <Hotel className="w-5 h-5 text-current" />;
            case "vacation_rental":
                return <Home className="w-5 h-5 text-current" />;
            default:
                return <HomeOutlineRoundedIcon className="w-5 h-5 text-current" />;
        }
    }, [selectedStream]);

    const metrics: Record<"total" | "active" | "cancelled", {
        label: string;
        value: string;
        icon: React.ReactNode;
        notation: string;
    }> = {
        total: {
            label: "Total Bookings",
            value: streamStats.total.toString(),
            icon: <ChartBoldIcon className="w-5 h-5 text-current" />,
            notation: "(Confirmed + Completed + Pending)",
        },
        active: {
            label: "Active Bookings",
            value: streamStats.confirmed.toString(),
            icon: <Calendar className="w-5 h-5 text-current" />,
            notation: "(Only confirmed bookings)",
        },
        cancelled: {
            label: "Cancelled",
            value: streamStats.cancelled.toString(),
            icon: <XCircle className="w-5 h-5 text-current" />,
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
        { id: "all" as StreamTab, label: "All Stats", icon: HomeOutlineRoundedIcon },
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
                                        ? "bg-[#1F1E1B] text-white dark:bg-indigo-600 dark:border-indigo-600 shadow-xs border border-[#1F1E1B]"
                                        : "bg-[#DBD5C8]/80 dark:bg-slate-800 text-[#5A544A] dark:text-slate-400 hover:text-[#1A1916] dark:hover:text-slate-100 hover:bg-[#DBD5C8] dark:hover:bg-slate-700 border border-[#D2CABC] dark:border-slate-700"
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
                <div className="bg-[#E5DFD4] dark:bg-slate-900 p-3 sm:p-4 md:p-4 rounded-md shadow-xs border border-[#D2CABC] dark:border-slate-800 flex flex-col justify-between group hover:border-[#1F1E1B]/30 dark:hover:border-slate-700 transition-all duration-200 relative">
                    <div className="flex justify-between items-start mb-1.5 gap-1">
                        <p className="text-[11px] sm:text-xs font-bold text-[#686259] dark:text-slate-400 uppercase tracking-wider truncate">
                            {currentMetric.label}
                        </p>

                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#1F1E1B] dark:text-slate-200 bg-[#DBD5C8] dark:bg-slate-800 border border-[#D2CABC] dark:border-slate-700 px-2 py-0.5 rounded-md hover:bg-[#DBD5C8]/80 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap active:scale-95"
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
                                    <div className="absolute right-0 top-full mt-1 bg-[#E5DFD4] dark:bg-slate-900 border border-[#D2CABC] dark:border-slate-800 rounded-md shadow-xl py-1 z-[50] min-w-[130px] animate-in fade-in slide-in-from-top-1">
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("total", e)}
                                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "total"
                                                    ? "text-[#1F1E1B] dark:text-white bg-[#DBD5C8] dark:bg-slate-800 font-bold"
                                                    : "text-[#1A1916] dark:text-slate-300 hover:bg-[#DBD5C8]/50 dark:hover:bg-slate-800/60"
                                            }`}
                                        >
                                            Total Bookings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("active", e)}
                                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "active"
                                                    ? "text-[#1F1E1B] dark:text-white bg-[#DBD5C8] dark:bg-slate-800 font-bold"
                                                    : "text-[#1A1916] dark:text-slate-300 hover:bg-[#DBD5C8]/50 dark:hover:bg-slate-800/60"
                                            }`}
                                        >
                                            Active Bookings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSelect("cancelled", e)}
                                            className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                selectedMetric === "cancelled"
                                                    ? "text-[#1F1E1B] dark:text-white bg-[#DBD5C8] dark:bg-slate-800 font-bold"
                                                    : "text-[#1A1916] dark:text-slate-300 hover:bg-[#DBD5C8]/50 dark:hover:bg-slate-800/60"
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
                            <h2 className="text-xl sm:text-2xl md:text-[22px] font-extrabold text-[#1A1916] dark:text-slate-100 tracking-tight group-hover:text-[#1F1E1B] dark:group-hover:text-white transition-colors truncate">
                                {isLoading ? "..." : currentMetric.value}
                            </h2>
                            <p className="text-[10px] sm:text-[11px] font-medium text-[#686259] dark:text-slate-400 mt-0.5 italic leading-tight truncate">
                                {currentMetric.notation}
                            </p>
                        </div>
                        <div className="text-xl sm:text-2xl text-[#1F1E1B] dark:text-slate-200 bg-[#DBD5C8] dark:bg-slate-800 group-hover:bg-[#1F1E1B]/10 dark:group-hover:bg-slate-700/60 w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-[#1F1E1B]/20 dark:group-hover:border-slate-600 shrink-0">
                            {currentMetric.icon}
                        </div>
                    </div>
                </div>

                <StatsCard
                    title="Revenue"
                    value={isLoading ? "..." : formatRevenue(streamStats.revenue)}
                    icon={<IndianRupeeIcon className="w-5 h-5 text-current" />}
                />
                <StatsCard
                    title={propertyLabel}
                    value={isLoading ? "..." : (streamStats.properties ?? 0).toString()}
                    icon={propertyIcon}
                />
                <StatsCard
                    title={roomsLabel}
                    value={isLoading ? "..." : (streamStats.rooms ?? 0).toString()}
                    icon={<BedIcon className="w-5 h-5 text-current" />}
                />
            </div>
        </div>
    );
}
