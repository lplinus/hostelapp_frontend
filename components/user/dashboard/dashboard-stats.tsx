"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import StatsCard from "./stats-card";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DashboardStats {
    total_hostels: number;
    total_rooms: number;
    active_bookings: number;
    total_bookings: number;
    cancelled_bookings: number;
    revenue: number;
    chart_data: { month: string; count: number }[];
}

export default function DashboardStats() {
    const [selectedMetric, setSelectedMetric] = useState<"total" | "active" | "cancelled">("total");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats"],
        queryFn: () => authApiClient.get("/api/dashboard/stats/"),
        refetchInterval: 5000,
    });

    const formatRevenue = (value: number | undefined) => {
        if (value === undefined || value === null) return "0";
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        return `₹${value.toLocaleString("en-IN")}`;
    };

    const metrics = {
        total: {
            label: "Total Bookings",
            value: data?.total_bookings?.toString() || "0",
            icon: "📊",
            notation: "(Confirmed + Completed + Pending)"
        },
        active: {
            label: "Active Bookings",
            value: data?.active_bookings?.toString() || "0",
            icon: "📅",
            notation: "(Only confirmed bookings)"
        },
        cancelled: {
            label: "Cancelled",
            value: data?.cancelled_bookings?.toString() || "0",
            icon: "❌",
            notation: "(Revoked bookings)"
        }
    };

    const currentMetric = metrics[selectedMetric];

    const handleSelect = (mode: "total" | "active" | "cancelled", e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMetric(mode);
        setIsDropdownOpen(false);
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Selector Card for Booking Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-blue-200 transition-all relative">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {currentMetric.label}
                    </p>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            SWITCH <ChevronDown size={10} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-[50] min-w-[120px] animate-in fade-in slide-in-from-top-1">
                                    <button
                                        type="button"
                                        onClick={(e) => handleSelect("total", e)}
                                        className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedMetric === 'total' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Total Bookings
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSelect("active", e)}
                                        className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedMetric === 'active' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Active Bookings
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSelect("cancelled", e)}
                                        className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedMetric === 'cancelled' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
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
                        <h2 className="text-3xl font-black text-gray-900">
                            {isLoading ? "..." : currentMetric.value}
                        </h2>
                        <p className="text-[9px] font-medium text-gray-500 mt-1 italic">
                            {currentMetric.notation}
                        </p>
                    </div>
                    <div className="text-4xl bg-gray-50 group-hover:bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300">
                        {currentMetric.icon}
                    </div>
                </div>
            </div>

            <StatsCard
                title="Revenue"
                value={isLoading ? "..." : formatRevenue(data?.revenue)}
                icon="💰"
            />
            <StatsCard
                title="Total Hostels"
                value={isLoading ? "..." : (data?.total_hostels?.toString() || "0")}
                icon="🏨"
            />
            <StatsCard
                title="Total Rooms"
                value={isLoading ? "..." : (data?.total_rooms?.toString() || "0")}
                icon="🛏️"
            />
        </div>
    );
}
