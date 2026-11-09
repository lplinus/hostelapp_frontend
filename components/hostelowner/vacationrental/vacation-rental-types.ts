export const CATEGORIES = [
    { value: "villa", label: "Villa" },
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "Independent House" },
    { value: "cottage", label: "Cottage" },
    { value: "farmhouse", label: "Farmhouse" },
    { value: "beach_house", label: "Beach House" },
    { value: "cabin", label: "Cabin" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
];

export const RENTAL_TYPES = [
    { value: "entire_place", label: "Entire Place" },
    { value: "private_room", label: "Private Room" },
    { value: "shared_room", label: "Shared Room" },
];

export const CANCELLATION_POLICIES = [
    { value: "flexible", label: "Flexible (Full refund up to 1 day prior)" },
    { value: "moderate", label: "Moderate (Full refund up to 5 days prior)" },
    { value: "strict", label: "Strict (50% refund up to 7 days prior)" },
    { value: "non_refundable", label: "Non-Refundable" },
];

export interface VacationRentalManagementProps {
    activeTab?: "properties" | "rooms";
    onTabChange?: (tab: "properties" | "rooms") => void;
    hideSubTabs?: boolean;
}

export interface VacationRentalFormData {
    title: string;
    tagline: string;
    category: string;
    rental_type: string;
    city: string;
    area: string;
    address: string;
    postal_code: string;
    max_guests: string;
    bedrooms: string;
    beds: string;
    bathrooms: string;
    price_per_night: string;
    weekend_price_per_night: string;
    cleaning_fee: string;
    security_deposit: string;
    weekly_discount_percentage: string;
    monthly_discount_percentage: string;
    min_nights: string;
    max_nights: string;
    check_in_time: string;
    check_out_time: string;
    cancellation_policy: string;
    instant_book: boolean;
    allows_pets: boolean;
    allows_smoking: boolean;
    allows_parties: boolean;
    custom_rules: string;
    caretaker_name: string;
    caretaker_number: string;
    wifi_name: string;
    wifi_password: string;
    short_description: string;
    description: string;
    amenities: number[];
}

export const INITIAL_FORM_DATA: VacationRentalFormData = {
    title: "",
    tagline: "",
    category: "villa",
    rental_type: "entire_place",
    city: "",
    area: "",
    address: "",
    postal_code: "",
    max_guests: "4",
    bedrooms: "2",
    beds: "2",
    bathrooms: "2.0",
    price_per_night: "",
    weekend_price_per_night: "",
    cleaning_fee: "0",
    security_deposit: "0",
    weekly_discount_percentage: "0",
    monthly_discount_percentage: "0",
    min_nights: "1",
    max_nights: "30",
    check_in_time: "15:00",
    check_out_time: "11:00",
    cancellation_policy: "moderate",
    instant_book: true,
    allows_pets: false,
    allows_smoking: false,
    allows_parties: false,
    custom_rules: "",
    caretaker_name: "",
    caretaker_number: "",
    wifi_name: "",
    wifi_password: "",
    short_description: "",
    description: "",
    amenities: [],
};
