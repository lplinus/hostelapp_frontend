import { authApiClient } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { tokenManager } from "@/lib/token";
import type {
    VacationRental,
    VacationRentalBooking,
    VacationRentalBookingInput,
    VacationRentalBookingQueryParams
} from "@/types/vacationrental.types";

export const getMyVacationRentalBookings = async (
    params?: VacationRentalBookingQueryParams
): Promise<VacationRentalBooking[]> => {
    return authApiClient.get<VacationRentalBooking[]>("/api/vacanationrentals/bookings/my-bookings/", {
        params: params as Record<string, string | number | boolean | undefined>,
    });
};

export const getHostedVacationRentalBookings = async (
    params?: VacationRentalBookingQueryParams
): Promise<VacationRentalBooking[]> => {
    return authApiClient.get<VacationRentalBooking[]>("/api/vacanationrentals/bookings/hosted-bookings/", {
        params: params as Record<string, string | number | boolean | undefined>,
    });
};

export const getVacationRentalBookingById = async (
    id: string
): Promise<VacationRentalBooking> => {
    return authApiClient.get<VacationRentalBooking>(`/api/vacanationrentals/bookings/${id}/`);
};

export const approveVacationRentalBooking = async (
    id: string
): Promise<VacationRentalBooking> => {
    return authApiClient.post<VacationRentalBooking>(`/api/vacanationrentals/bookings/${id}/approve/`, {});
};

export const declineVacationRentalBooking = async (
    id: string,
    reason: string = "Declined by host"
): Promise<VacationRentalBooking> => {
    return authApiClient.post<VacationRentalBooking>(`/api/vacanationrentals/bookings/${id}/decline/`, {
        reason,
    });
};

export const cancelVacationRentalBooking = async (
    id: string,
    reason: string = "Cancelled by user"
): Promise<VacationRentalBooking> => {
    return authApiClient.post<VacationRentalBooking>(`/api/vacanationrentals/bookings/${id}/cancel/`, {
        reason,
    });
};

export const createVacationRentalBooking = async (
    data: VacationRentalBookingInput
): Promise<VacationRentalBooking> => {
    return authApiClient.post<VacationRentalBooking>("/api/vacanationrentals/bookings/", data);
};

export interface CheckVacationRentalAvailabilityParams {
    rental_id: string;
    check_in_date: string;
    check_out_date: string;
    guest_email?: string;
    mobile_number?: string;
}

export interface CheckVacationRentalAvailabilityResponse {
    available: boolean;
    rental_id?: string;
    rental_title?: string;
    message?: string;
    error?: string;
}

export const checkVacationRentalAvailability = async (
    params: CheckVacationRentalAvailabilityParams
): Promise<CheckVacationRentalAvailabilityResponse> => {
    const token = tokenManager.getAccessToken();
    const options: any = { params };
    if (token) {
        options.headers = {
            Authorization: `Bearer ${token}`,
        };
    }
    return apiClient.get<CheckVacationRentalAvailabilityResponse>(
        "/api/vacanationrentals/bookings/check-availability/",
        options
    );
};

export const getVacationRentals = async (
    params?: Record<string, string | number | boolean | undefined>
): Promise<VacationRental[]> => {
    const data = await apiClient.get<any>("/api/vacanationrentals/properties/", { params });
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

export const getVacationRentalBySlug = async (
    slug: string
): Promise<VacationRental> => {
    return apiClient.get<VacationRental>(`/api/vacanationrentals/properties/${slug}/`);
};

export const getMyVacationRentals = async (): Promise<VacationRental[]> => {
    const data = await authApiClient.get<any>("/api/vacanationrentals/properties/my-rentals/");
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

export const createVacationRental = async (
    data: Partial<VacationRental>
): Promise<VacationRental> => {
    return authApiClient.post<VacationRental>("/api/vacanationrentals/properties/", data);
};

export const updateVacationRental = async (
    slug: string,
    data: Partial<VacationRental>
): Promise<VacationRental> => {
    return authApiClient.patch<VacationRental>(`/api/vacanationrentals/properties/${slug}/`, data);
};

export const deleteVacationRental = async (slug: string): Promise<void> => {
    return authApiClient.delete(`/api/vacanationrentals/properties/${slug}/`);
};

export const uploadVacationRentalImages = async (
    data: FormData
): Promise<any> => {
    return authApiClient.post("/api/vacanationrentals/images/", data);
};

export const deleteVacationRentalImage = async (
    imageId: number
): Promise<void> => {
    return authApiClient.delete(`/api/vacanationrentals/images/${imageId}/`);
};

export const blockVacationRentalDates = async (
    slug: string,
    payload: { start_date: string; end_date: string; reason?: string }
): Promise<{ detail: string }> => {
    return authApiClient.post<{ detail: string }>(
        `/api/vacanationrentals/properties/${slug}/block-dates/`,
        payload
    );
};

