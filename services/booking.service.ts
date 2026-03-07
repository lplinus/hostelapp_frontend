import { authApiClient } from "@/lib/api/auth-client";

export interface Booking {
    id: number;
    user: number;
    user_name?: string;
    hostel: number;
    hostel_name?: string;
    room_type: number;
    room_category?: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    total_price: string;
}

export const getOwnerBookings = async (): Promise<Booking[]> => {
    return authApiClient.get<Booking[]>("/api/bookings/owner/");
};

export const updateBookingStatus = async (id: number | string, status: string): Promise<Booking> => {
    return authApiClient.patch<Booking>(`/api/bookings/${id}/`, { status });
};
