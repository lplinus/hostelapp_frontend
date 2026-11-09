import type { Hotel } from "@/types/hotel.types";
import type { CityItem, AreaItem } from "@/services/location.service";
import type { AmenityItem } from "@/services/hostelservices/amenity.service";
import type { UseMutationResult } from "@tanstack/react-query";

export interface HotelFormData {
    name: string;
    tagline: string;
    hotel_type: string;
    star_rating: number;
    city: string;
    area: string;
    address: string;
    postal_code: string;
    latitude: string;
    longitude: string;
    check_in_time: string;
    check_out_time: string;
    cancellation_policy: string;
    allows_pets: boolean;
    description: string;
    short_description: string;
    amenities: number[];
}

export interface RoomFormData {
    name: string;
    category: string;
    bed_type: string;
    base_price_per_night: string;
    total_rooms: string;
    rooms_available: string;
    max_adults: string;
    max_children: string;
    has_balcony: boolean;
    has_view: boolean;
}

export interface PhotoPreviews {
    [key: string]: string | null;
    image: string | null;
    image2: string | null;
    image3: string | null;
    image4: string | null;
    image5: string | null;
}

export type TabType = "properties" | "rooms" | "bookings";
