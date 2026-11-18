import { authApiClient } from "@/lib/api/auth-client";

// ─── Raw API response types (snake_case from Django) ───────────────────────

export interface GuestDocumentAPIResponse {
    id: string;
    is_primary_guest: boolean;
    member_name: string;
    document_type: "aadhaar" | "passport" | "driving_license" | "voter_id" | "national_id" | "other";
    document_type_name: string;
    document_number: string | null;
    file: string;
    file_url: string;
    file_name: string;
    file_size: number;
    booking_reference: string | null;
    verification_status: "unverified" | "pending" | "verified" | "rejected";
    created_at: string;
    updated_at: string;
}

export interface GuestDocumentsListAPIResponse {
    documents: GuestDocumentAPIResponse[];
    max_allowed: number;
    uploaded_count: number;
    remaining_slots: number;
}

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
    max_document_uploads?: number;
    aadhaar_number: string | null;
    aadhaar_card_file: string | null;
    aadhaar_file_name: string | null;
    aadhaar_file_url: string | null;
    id_verification_status: "unverified" | "pending" | "verified" | "rejected";
    share_id_with_host?: boolean;
    verified_at: string | null;
    rejection_reason: string | null;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    documents?: GuestDocumentAPIResponse[];
    created_at: string;
    updated_at: string;
}

export interface GuestBookingAPIResponse {
    id: string;
    booking_type: "hostel" | "hotel" | "vacation_rental";
    booking_reference: string;
    property_id?: string | number | null;
    property_slug?: string | null;
    property_name: string;
    room_title: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    total_price: string;
    guests_count: number;
    payment_status: string;
    has_reviewed?: boolean;
    review_rating?: number | null;
    review_comment?: string | null;
    created_at: string | null;
}

// ─── API calls ─────────────────────────────────────────────────────────────

const GUEST_PROFILE_ENDPOINT = "/api/guestprofile/me/";
const GUEST_DOCUMENTS_ENDPOINT = "/api/guestprofile/documents/";
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
 * Fetch guest & member documents with slot calculation.
 */
export const getGuestDocuments = async (bookingRef?: string): Promise<GuestDocumentsListAPIResponse> => {
    const url = bookingRef 
        ? `${GUEST_DOCUMENTS_ENDPOINT}?booking_ref=${encodeURIComponent(bookingRef)}`
        : GUEST_DOCUMENTS_ENDPOINT;
    return authApiClient.get<GuestDocumentsListAPIResponse>(url);
};

/**
 * Upload a document (Primary Guest or Friend/Member).
 */
export const uploadGuestDocument = async (formData: FormData): Promise<GuestDocumentAPIResponse> => {
    return authApiClient.post<GuestDocumentAPIResponse>(GUEST_DOCUMENTS_ENDPOINT, formData);
};

/**
 * Delete a specific guest/member document.
 */
export const deleteGuestDocument = async (id: string): Promise<{ detail: string }> => {
    return authApiClient.delete<{ detail: string }>(`${GUEST_DOCUMENTS_ENDPOINT}${id}/`);
};

/**
 * Update document metadata (member name, category, document number).
 */
export const updateGuestDocument = async (
    id: string,
    data: Partial<GuestDocumentAPIResponse>
): Promise<GuestDocumentAPIResponse> => {
    return authApiClient.patch<GuestDocumentAPIResponse>(`${GUEST_DOCUMENTS_ENDPOINT}${id}/`, data);
};

/**
 * Fetch all bookings for the logged-in guest (hostel + hotel + vacation rental).
 */
export const getGuestBookings = async (): Promise<GuestBookingAPIResponse[]> => {
    return authApiClient.get<GuestBookingAPIResponse[]>(GUEST_BOOKINGS_ENDPOINT);
};
