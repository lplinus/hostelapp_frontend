"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { useAuth } from "@/hooks/useAuth";
import BookingPieChart from "./booking-pie-chart";

interface DashboardStats {
    total_bookings: number;
    cancelled_bookings: number;
}

export default function BookingChartWrapper() {
    const { user } = useAuth();
    const { data, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats", user?.id],
        queryFn: () => authApiClient.get("/api/dashboard/stats/"),
        enabled: !!user?.id,
        refetchInterval: 5000,
    });

    return (
        <BookingPieChart
            total={data?.total_bookings || 0}
            cancelled={data?.cancelled_bookings || 0}
            isLoading={isLoading}
        />
    );
}
