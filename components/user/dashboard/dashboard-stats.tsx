"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import StatsCard from "./stats-card";

interface DashboardStats {
    total_hostels: number;
    total_rooms: number;
    active_bookings: number;
    revenue: number;
}

export default function DashboardStats() {
    const { data, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats"],
        queryFn: () => authApiClient.get("/api/dashboard/stats/"),
    });

    // Helper to format large numbers to Indian Lakhs/Crores
    const formatRevenue = (value: number | undefined) => {
        if (value === undefined || value === null) return "0";
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        return `₹${value.toLocaleString("en-IN")}`;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <StatsCard
                title="Active Bookings"
                value={isLoading ? "..." : (data?.active_bookings?.toString() || "0")}
                icon="📅"
            />
            <StatsCard
                title="Revenue"
                value={isLoading ? "..." : formatRevenue(data?.revenue)}
                icon="💰"
            />
        </div>
    );
}
