import { authApiClient } from "@/lib/api/auth-client";

export interface DashboardStats {
    total_hostels: number;
    total_rooms: number;
    active_bookings: number;
    revenue: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    return authApiClient.get<DashboardStats>("/api/dashboard/stats/");
};
