import { authApiClient } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import type {
    Hotel,
    HotelRoomType,
    HotelBooking,
    HotelBookingQueryParams
} from "@/types/hotel.types";

export const getMyHotels = async (): Promise<Hotel[]> => {
    const data = await authApiClient.get<any>("/api/hotels/properties/my-hotels/");
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

export const getHotels = async (
    params?: Record<string, string | number | boolean | undefined>
): Promise<Hotel[]> => {
    const data = await apiClient.get<any>("/api/hotels/properties/", { params });
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

export const getHotelBySlug = async (
    slug: string
): Promise<Hotel> => {
    return apiClient.get<Hotel>(`/api/hotels/properties/${slug}/`);
};

export const createHotel = async (
    data: any
): Promise<Hotel> => {
    return authApiClient.post<Hotel>("/api/hotels/properties/", data);
};

export const updateHotel = async (
    slugOrId: string,
    data: any
): Promise<Hotel> => {
    return authApiClient.patch<Hotel>(`/api/hotels/properties/${slugOrId}/`, data);
};

export const deleteHotel = async (
    slugOrId: string
): Promise<void> => {
    return authApiClient.delete<void>(`/api/hotels/properties/${slugOrId}/`);
};

export const createHotelRoomType = async (
    data: any
): Promise<HotelRoomType> => {
    return authApiClient.post<HotelRoomType>("/api/hotels/room-types/", data);
};

export const uploadHotelImages = async (
    data: FormData
): Promise<any> => {
    return authApiClient.post("/api/hotels/images/", data);
};

export const deleteHotelImage = async (
    imageId: number
): Promise<void> => {
    return authApiClient.delete(`/api/hotels/images/${imageId}/`);
};

export const getHotelRoomTypes = async (
    params?: Record<string, string | number | boolean | undefined>
): Promise<HotelRoomType[]> => {
    return apiClient.get<HotelRoomType[]>("/api/hotels/room-types/", { params });
};

export const getMyHotelBookings = async (
    params?: HotelBookingQueryParams
): Promise<HotelBooking[]> => {
    return authApiClient.get<HotelBooking[]>("/api/hotels/bookings/my-bookings/", {
        params: params as Record<string, string | number | boolean | undefined>,
    });
};

export const getHotelBookings = async (
    params?: HotelBookingQueryParams
): Promise<HotelBooking[]> => {
    return authApiClient.get<HotelBooking[]>("/api/hotels/bookings/", {
        params: params as Record<string, string | number | boolean | undefined>,
    });
};

export const getHotelBookingById = async (
    id: string
): Promise<HotelBooking> => {
    return authApiClient.get<HotelBooking>(`/api/hotels/bookings/${id}/`);
};

export const cancelHotelBooking = async (
    id: string,
    reason: string = "Cancelled by guest"
): Promise<HotelBooking> => {
    return authApiClient.post<HotelBooking>(`/api/hotels/bookings/${id}/cancel/`, {
        reason,
    });
};
