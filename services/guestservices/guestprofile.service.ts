import { authApiClient } from "@/lib/api/auth-client";

// ─── Raw API response types (snake_case from Django) ───────────────────────

export interface GuestProfileAPIResponse {
    id: string;
    username: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    profile_picture: string | null;
    date_of_birth: string | null;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
    nationality: string;
    address_line: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relation: string | null;
    aadhaar_number: string | null;
    aadhaar_card_file: string | null;
    aadhaar_file_name: string | null;
    aadhaar_file_url: string | null;
    id_verification_status: "unverified" | "pending" | "verified" | "rejected";
    verified_at: string | null;
    rejection_reason: string | null;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface GuestBookingAPIResponse {
    id: string;
    booking_type: "hostel" | "hotel" | "vacation_rental";
    booking_reference: string;
    property_name: string;
    room_title: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    total_price: string;
    guests_count: number;
    payment_status: string;
    created_at: string | null;
}

// ─── API calls ─────────────────────────────────────────────────────────────

const GUEST_PROFILE_ENDPOINT = "/api/guestprofile/me/";
const GUEST_BOOKINGS_ENDPOINT = "/api/guestprofile/bookings/";

/**
 * Fetch the logged-in guest's profile.
 */
export const getGuestProfile = async (): Promise<GuestProfileAPIResponse> => {
    return authApiClient.get<GuestProfileAPIResponse>(GUEST_PROFILE_ENDPOINT);
};

/**
 * Update the logged-in guest's profile (partial update).
 * Supports both JSON data and FormData (for file uploads like Aadhaar).
 */
export const updateGuestProfile = async (
    data: Partial<GuestProfileAPIResponse> | FormData
): Promise<GuestProfileAPIResponse> => {
    return authApiClient.patch<GuestProfileAPIResponse>(GUEST_PROFILE_ENDPOINT, data);
};

/**
 * Fetch all bookings for the logged-in guest (hostel + hotel + vacation rental).
 */
export const getGuestBookings = async (): Promise<GuestBookingAPIResponse[]> => {
    return authApiClient.get<GuestBookingAPIResponse[]>(GUEST_BOOKINGS_ENDPOINT);
};

