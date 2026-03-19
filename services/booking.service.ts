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
    mobile_number: string;
    guest_age: number;
    adults: number;
    children: number;
    check_in: string;
    check_out: string;
    guests_count: number;
    status: string;
    total_price: string;
    booking_type: 'stay' | 'visit';
    stay_duration?: 'none' | '1_month' | '2_months' | '3_months' | '4_months' | '5_months' | 'gt_5_months';
    created_at?: string;
    payment_id?: string;
    payment_status?: string;
}

export interface BookingRequest {
    hostel: number;
    room_type: number;
    guest_name: string;
    guest_email: string;
    mobile_number: string;
    guest_age: number;
    adults: number;
    children: number;
    check_in: string;
    check_out: string;
    guests_count: number;
    total_price: number;
    booking_type: 'stay' | 'visit';
    stay_duration?: 'none' | '1_month' | '2_months' | '3_months' | '4_months' | '5_months' | 'gt_5_months';
}

export const getOwnerBookings = async (params?: any): Promise<Booking[]> => {
    return authApiClient.get<Booking[]>("/api/bookings/owner/", { params });
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

export const checkInBooking = async (booking_id: string): Promise<{ message: string, booking_id: string }> => {
    return authApiClient.post<{ message: string, booking_id: string }>("/api/bookings/checkin/", { booking_id });
};

export const sendBookingOtp = async (phone: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/api/bookings/send_otp/", { phone });
};

export const verifyBookingOtp = async (phone: string, code: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/api/bookings/verify_otp/", { phone, code });
};

export const createRazorpayOrder = async (bookingId: string): Promise<any> => {
    const token = tokenManager.getAccessToken();
    const options: any = {};
    if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
    }
    return apiClient.post<any>("/api/payments/create_razorpay_order/", { booking_id: bookingId }, options);
};

export const verifyRazorpayPayment = async (data: any): Promise<any> => {
    const token = tokenManager.getAccessToken();
    const options: any = {};
    if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
    }
    return apiClient.post<any>("/api/payments/verify_razorpay_payment/", data, options);
};
