import { authApiClient } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { tokenManager } from "@/lib/token";

export interface Booking {
    id: string;
    user: number | null;
    user_name?: string;
    hostel: number;
    hostel_name?: string;
    room_type: number;
    room_category?: string;
    guest_name: string;
    guest_email: string;
    guest_age: number;
    adults: number;
    children: number;
    check_in: string;
    check_out: string;
    guests_count: number;
    status: string;
    total_price: string;
}

export interface BookingRequest {
    hostel: number;
    room_type: number;
    guest_name: string;
    guest_email: string;
    guest_age: number;
    adults: number;
    children: number;
    check_in: string;
    check_out: string;
    guests_count: number;
    total_price: number;
}

export const getOwnerBookings = async (): Promise<Booking[]> => {
    return authApiClient.get<Booking[]>("/api/bookings/owner/");
};

export const updateBookingStatus = async (id: number | string, status: string): Promise<Booking> => {
    return authApiClient.patch<Booking>(`/api/bookings/${id}/`, { status });
};

export const deleteBooking = async (id: number | string): Promise<void> => {
    return authApiClient.delete<void>(`/api/bookings/${id}/`);
};

export const createBooking = async (data: BookingRequest): Promise<Booking> => {
    const token = tokenManager.getAccessToken();
    const options: any = {};

    if (token) {
        options.headers = {
            'Authorization': `Bearer ${token}`
        };
    }

    // Use apiClient instead of authApiClient to avoid automatic redirects on auth failure
    return apiClient.post<Booking>("/api/bookings/", data, options);
};
