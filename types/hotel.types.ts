export type HotelBookingStatus =
    | "pending"
    | "confirmed"
    | "checked_in"
    | "completed"
    | "cancelled";

export type HotelPaymentMethod =
    | "online"
    | "pay_at_property"
    | "upi"
    | "card"
    | "net_banking";

export type HotelPaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

export interface HotelGuest {
    guest_name: string;
    guest_email: string;
    mobile_number: string;
    adults_count: number;
    children_count: number;
    total_guests: number;
    special_requests?: string;
    created_at?: string;
}

export interface HotelPayment {
    room_rate_applied: string;
    stay_subtotal: string;
    taxes_and_fees: string;
    discount_amount: string;
    total_amount: string;
    payment_method: HotelPaymentMethod;
    payment_method_display?: string;
    payment_status: HotelPaymentStatus;
    payment_status_display?: string;
    transaction_id?: string;
    paid_at?: string;
    created_at?: string;
}

export interface HotelCancellation {
    cancellation_policy_applied: string;
    cancelled_by: "guest" | "hotel_admin" | "system";
    cancelled_by_display?: string;
    reason: string;
    refund_amount: string;
    refund_status: "not_applicable" | "pending" | "processed" | "rejected";
    refund_status_display?: string;
    cancelled_at: string;
}

export interface HotelBooking {
    id: string;
    booking_reference: string;
    user: number | null;
    hotel: string;
    hotel_name: string;
    room_type: number;
    room_type_name: string;
    check_in_date: string;
    check_out_date: string;
    number_of_nights: number;
    number_of_rooms: number;
    total_amount: string;
    status: HotelBookingStatus;
    status_display: string;
    guest_details: HotelGuest | null;
    payment_details: HotelPayment | null;
    cancellation_details: HotelCancellation | null;
    created_at: string;
    updated_at: string;
}

export interface HotelImage {
    id: number;
    image: string;
    caption?: string;
    is_primary: boolean;
    display_order: number;
}

export interface HotelRoomType {
    id: number;
    hotel: string;
    name: string;
    category?: string;
    room_category?: string;
    category_display?: string;
    price_per_night?: string;
    base_price_per_night?: string;
    weekend_price_per_night?: string;
    total_rooms: number;
    rooms_available: number;
    max_adults: number;
    max_children: number;
    max_occupancy?: number;
    bed_type: string;
    bed_display?: string;
    room_size_sqft?: number | null;
    has_balcony?: boolean;
    has_view?: boolean;
    includes_breakfast?: boolean;
    is_refundable?: boolean;
    is_available: boolean;
}

export interface Hotel {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    description: string;
    short_description?: string;
    hotel_type: string;
    hotel_type_display?: string;
    star_rating: number;
    city: number;
    city_name?: string;
    area?: number;
    area_name?: string;
    address: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    check_in_time: string;
    check_out_time: string;
    starting_price_per_night: string;
    amenities_list?: Array<{ id: number; name: string; icon?: string }>;
    cancellation_policy: string;
    allows_pets: boolean;
    rating_avg: string;
    rating_count: number;
    is_featured: boolean;
    is_toprated: boolean;
    is_verified: boolean;
    is_active: boolean;
    og_image?: string;
    images?: HotelImage[];
    room_types?: HotelRoomType[];
    created_at?: string;
    updated_at?: string;
}

export interface HotelBookingQueryParams {
    search?: string;
    status?: HotelBookingStatus | "all";
    check_in_date__gte?: string;
    check_in_date__lte?: string;
    hotel?: string;
    ordering?: string;
}
