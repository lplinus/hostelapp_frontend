"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import BookingPieChart from "./booking-pie-chart";

interface DashboardStats {
    total_bookings: number;
    cancelled_bookings: number;
}

export default function BookingChartWrapper() {
    const { data, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats"],
        queryFn: () => authApiClient.get("/api/dashboard/stats/"),
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
