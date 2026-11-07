export type VacationRentalBookingStatus =
    | "pending_approval"
    | "confirmed"
    | "declined"
    | "checked_in"
    | "completed"
    | "cancelled";

export type VacationRentalPaymentMethod =
    | "online"
    | "pay_on_arrival"
    | "upi"
    | "card"
    | "net_banking";

export type VacationRentalPaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

export interface VacationRentalGuest {
    guest_name: string;
    guest_email: string;
    mobile_number: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    total_guests: number;
    special_requests?: string;
    created_at?: string;
}

export interface VacationRentalPricing {
    nightly_rate_applied: string;
    stay_subtotal: string;
    cleaning_fee: string;
    service_fee: string;
    security_deposit: string;
    discount_amount: string;
    total_price: string;
    payment_method: VacationRentalPaymentMethod;
    payment_method_display?: string;
    payment_status: VacationRentalPaymentStatus;
    payment_status_display?: string;
    transaction_id?: string;
    paid_at?: string;
    created_at?: string;
}

export interface VacationRentalCancellation {
    cancellation_policy_applied: string;
    cancelled_by: "guest" | "host" | "admin" | "system";
    cancelled_by_display?: string;
    reason: string;
    refund_amount: string;
    refund_status: "not_applicable" | "pending" | "processed" | "rejected";
    refund_status_display?: string;
    cancelled_at: string;
}

export interface VacationRentalBooking {
    id: string;
    booking_reference: string;
    user: number | null;
    rental: string;
    rental_title: string;
    host: number;
    host_name?: string;
    owner?: number | null;
    owner_name?: string;
    owner_email?: string;
    check_in_date: string;
    check_out_date: string;
    number_of_nights: number;
    total_price: string;
    status: VacationRentalBookingStatus;
    status_display: string;
    guest_details: VacationRentalGuest | null;
    pricing_details: VacationRentalPricing | null;
    cancellation_details: VacationRentalCancellation | null;
    created_at: string;
    updated_at: string;
}

export interface VacationRentalImage {
    id: number;
    image: string;
    caption?: string;
    is_primary: boolean;
    display_order: number;
}

export interface VacationRental {
    id: string;
    host: number;
    host_name?: string;
    title: string;
    slug: string;
    tagline?: string;
    description: string;
    short_description?: string;
    rental_type: string;
    rental_type_display?: string;
    category: string;
    category_display?: string;
    city: number;
    city_name?: string;
    area?: number;
    area_name?: string;
    address: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    max_guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    price_per_night: string;
    weekend_price_per_night?: string;
    cleaning_fee: string;
    security_deposit: string;
    weekly_discount_percentage: number;
    monthly_discount_percentage: number;
    min_nights: number;
    max_nights: number;
    check_in_time: string;
    check_out_time: string;
    instant_book: boolean;
    cancellation_policy: string;
    cancellation_policy_display?: string;
    allows_pets: boolean;
    allows_smoking: boolean;
    allows_parties: boolean;
    custom_rules?: string;
    caretaker_name?: string;
    caretaker_number?: string;
    wifi_name?: string;
    wifi_password?: string;
    amenities_list?: Array<{ id: number; name: string; icon?: string }>;
    rating_avg: string;
    rating_count: number;
    is_superhost: boolean;
    is_featured: boolean;
    is_verified: boolean;
    is_active: boolean;
    og_image?: string;
    images?: VacationRentalImage[];
    created_at?: string;
    updated_at?: string;
}

export interface VacationRentalBookingQueryParams {
    search?: string;
    status?: VacationRentalBookingStatus | "all";
    check_in_date__gte?: string;
    check_in_date__lte?: string;
    rental?: string;
    ordering?: string;
}

export interface VacationRentalBookingInput {
    rental_id: string;
    check_in_date: string;
    check_out_date: string;
    guest_name: string;
    guest_email: string;
    mobile_number: string;
    adults: number;
    children?: number;
    infants?: number;
    pets?: number;
    special_requests?: string;
    payment_method?: "online" | "on_arrival";
}

