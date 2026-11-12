"use client";

import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { useAuth } from "@/hooks/useAuth";
import BookingPieChart, { TimelinePoint, StreamData } from "./booking-pie-chart";

interface DashboardStats {
    total_bookings: number;
    cancelled_bookings: number;
    timeline?: TimelinePoint[];
    streams?: Record<string, StreamData>;
}

export default function BookingChartWrapper() {
    const { user } = useAuth();
    const { data, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats", user?.id],
        queryFn: () => authApiClient.get("/api/dashboard/stats/"),
        enabled: !!user?.id && user.id > 0,
        refetchInterval: 5000,
    });

    return (
        <BookingPieChart
            total={data?.total_bookings || 0}
            cancelled={data?.cancelled_bookings || 0}
            timeline={data?.timeline || []}
            streams={data?.streams}
            isLoading={isLoading || !data}
        />
    );
}
