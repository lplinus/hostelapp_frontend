export interface AdCampaignItem {
    id: number | string;
    campaign_name: string;
    ad_type: "sponsored_listing" | "display_banner";
    ad_type_display: string;
    placement: "search_feed_top" | "listing_sidebar" | "city_header";
    placement_display: string;
    property_type: "hotel" | "vacation_rental" | "hostel";
    property_type_display: string;
    hotel?: string | null;
    vacation_rental?: string | null;
    hostel?: number | null;
    target_property_title: string;
    target_property_city: string;
    target_property_address?: string;
    target_property_slug?: string;
    target_property_price?: number;
    target_property_rating?: number;
    property_image_url?: string | null;
    banner_image?: string | null;
    banner_image_url?: string | null;
    destination_url?: string | null;
    duration_days: number;
    budget: number | string;
    start_date: string;
    end_date?: string | null;
    status: "active" | "paused" | "completed" | "pending";
    status_display: string;
    impressions_count: number;
    clicks_count: number;
    ctr: number;
    days_remaining: number;
    is_active_serving: boolean;
    created_at: string;
    updated_at: string;
}

export interface AdCampaignStats {
    active_campaigns: number;
    total_impressions: number;
    total_clicks: number;
    avg_ctr: number;
}

export interface AdCampaignsResponse {
    campaigns: AdCampaignItem[];
    stats: AdCampaignStats;
}

export interface OwnerPropertyOption {
    id: string;
    title: string;
    property_type: "hotel" | "vacation_rental";
    property_type_display: string;
    city_name: string;
    price: number;
    rating: number;
    image_url?: string | null;
}

export interface AdPlanItem {
    id: number;
    plan_code: string;
    name: string;
    duration_days: number;
    duration_display: string;
    price: number | string;
    description: string;
    is_popular: boolean;
    is_active: boolean;
    order: number;
}

export interface CreateAdCampaignPayload {
    campaign_name: string;
    ad_type: "sponsored_listing" | "display_banner";
    placement: "search_feed_top" | "listing_sidebar" | "city_header";
    property_type: "hotel" | "vacation_rental";
    hotel?: string | null;
    vacation_rental?: string | null;
    duration_days: number;
    budget: number;
    destination_url?: string;
    banner_image?: File | null;
}
