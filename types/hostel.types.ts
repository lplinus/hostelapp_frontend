export interface HostelAmenity {
    readonly id: number;
    readonly name: string;
    readonly icon: string | null;
}

export interface HostelCity {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly latitude: string | null;
    readonly longitude: string | null;
    readonly state: number;
}

export interface HostelArea {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly latitude: string | null;
    readonly longitude: string | null;
    readonly city: number;
}

export interface HostelImage {
    readonly id: number;
    readonly image: string | null;
    readonly image2: string | null;
    readonly image3: string | null;
    readonly image4: string | null;
    readonly alt_text: string;
    readonly is_primary: boolean;
    readonly order: number;
}

export interface HostelReview {
    readonly id: number;
    readonly hostel: number;
    readonly user: number;
    readonly user_name: string;
    readonly rating: number;
    readonly comment: string;
    readonly created_at: string;
}

export interface DefaultHostelImage {
    readonly id: number;
    readonly image1: string | null;
    readonly image2: string | null;
    readonly image3: string | null;
    readonly image4: string | null;
    readonly alt_text: string;
}

export interface Bed {
    readonly id: number;
    readonly bed_number: string;
    readonly is_available: boolean;
    readonly total_beds: number | null;
    readonly beds_available: number | null;
}

export interface RoomType {
    readonly id: number;
    readonly room_category: string;
    readonly category_display: string;
    readonly sharing_type: number;
    readonly sharing_display: string;
    readonly base_price: string | null;
    readonly price_per_day: string | null;
    readonly is_available: boolean;
    readonly available_beds: number;
    readonly beds: readonly Bed[];
}

export interface HostelListItem {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly hostel_type: string;
    readonly owner: number;
    readonly city: HostelCity;
    readonly area: HostelArea | null;
    readonly description: string;
    readonly short_description: string;
    readonly price: string;
    readonly price_per_day: string | null;
    readonly is_discounted: boolean | null;
    readonly discount_percentage: string | null;
    readonly discounted_price: string | null;
    readonly discounted_price_per_day: string | null;
    readonly final_price: number | null;
    readonly final_price_per_day: number | null;
    readonly room_types: readonly RoomType[];
    readonly address: string;
    readonly postal_code: string | null;
    readonly latitude: string | null;
    readonly longitude: string | null;
    readonly check_in_time: string;
    readonly check_out_time: string;
    readonly rating_avg: number;
    readonly rating_count: number;
    readonly is_active: boolean;
    readonly is_featured: boolean;
    readonly is_toprated: boolean | null;
    readonly is_verified: boolean | null;
    readonly amenities: readonly HostelAmenity[];
    readonly images: readonly HostelImage[];
    readonly default_images: DefaultHostelImage | null;
    readonly created_at: string;
}

export interface HostelDetail extends HostelListItem {
    readonly reviews: readonly HostelReview[];
    // SEO fields (returned by backend HostelSerializer)
    readonly meta_title: string | null;
    readonly meta_description: string | null;
    readonly meta_keywords: string | null;
    readonly canonical_url: string | null;
    readonly og_image: string | null;
    readonly og_title: string | null;
    readonly og_description: string | null;
    readonly og_type: string;
    readonly structured_data: Record<string, unknown> | null;
    readonly is_indexed: boolean;
}

export interface CityHostel {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly hostel_type: string;
    readonly price: string;
    readonly price_per_day: string | null;
    readonly is_discounted: boolean | null;
    readonly discount_percentage: string | null;
    readonly final_price: number | null;
    readonly final_price_per_day: number | null;
    readonly rating: number;
    readonly thumbnail: string | null;
    readonly area_name: string | null;
    readonly city_name: string;
    readonly is_verified: boolean | null;
}

export interface CityHostelResponse {
    readonly city: string;
    readonly total: number;
    readonly results: readonly CityHostel[];
}

export interface HostelType {
    readonly id: number;
    readonly hostel_type: string;
    readonly name: string;
    readonly image: string | null;
    readonly alt_text: string;
}

export interface TypeHostelResponse {
    readonly type: string;
    readonly type_slug: string;
    readonly total: number;
    readonly results: readonly CityHostel[];
}

export interface SearchHostelResponse {
    readonly query: string;
    readonly budget: number | null;
    readonly gender: string;
    readonly total: number;
    readonly results: readonly CityHostel[];
}

