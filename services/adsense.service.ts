import { authApiClient } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import type {
    AdCampaignsResponse,
    AdCampaignItem,
    OwnerPropertyOption,
    CreateAdCampaignPayload,
    AdPlanItem,
} from "@/types/adsense.types";

/**
 * Fetch all ad campaigns for the logged-in owner, with stats summary.
 */
export const getOwnerCampaigns = async (status?: string): Promise<AdCampaignsResponse> => {
    const params = status && status !== "All" ? { status: status.toLowerCase() } : undefined;
    return authApiClient.get<AdCampaignsResponse>("/api/adsense/campaigns/", { params });
};

/**
 * Create a new sponsored or display banner campaign.
 */
export const createAdCampaign = async (
    payload: CreateAdCampaignPayload | FormData
): Promise<{ message: string; campaign: AdCampaignItem }> => {
    return authApiClient.post("/api/adsense/campaigns/", payload);
};

/**
 * Toggle campaign status between Active and Paused.
 */
export const toggleCampaignStatus = async (
    campaignId: number | string,
    action: "toggle" | "pause" | "resume" = "toggle"
): Promise<{ message: string; campaign: AdCampaignItem }> => {
    return authApiClient.patch(`/api/adsense/campaigns/${campaignId}/`, { action });
};

/**
 * Soft delete / archive a campaign.
 */
export const deleteCampaign = async (
    campaignId: number | string
): Promise<{ message: string }> => {
    return authApiClient.delete(`/api/adsense/campaigns/${campaignId}/`);
};

/**
 * Fetch the logged-in owner's Hotels and Vacation Rentals to populate the property selector.
 */
export const getOwnerPropertiesForAd = async (): Promise<OwnerPropertyOption[]> => {
    return authApiClient.get<OwnerPropertyOption[]>("/api/adsense/my-properties/");
};

/**
 * Public endpoint: Fetch currently active sponsored listings for search/city feeds.
 */
export const getActiveSponsoredAds = async (params?: {
    placement?: string;
    city_id?: number | string;
    city_slug?: string;
    property_type?: "hotel" | "vacation_rental" | "hostel" | string;
    city?: string;
    location?: string;
    search?: string;
    limit?: number;
}): Promise<AdCampaignItem[]> => {
    return apiClient.get<AdCampaignItem[]>("/api/adsense/active-sponsored/", { params });
};

/**
 * Track an ad impression (can be called via beacon or API).
 */
export const trackAdImpression = async (
    campaignId: number | string
): Promise<{ success: boolean }> => {
    return apiClient.post("/api/adsense/track-impression/", { campaign_id: campaignId });
};

/**
 * Track an ad click.
 */
export const trackAdClick = async (
    campaignId: number | string
): Promise<{ success: boolean }> => {
    return apiClient.post("/api/adsense/track-click/", { campaign_id: campaignId });
};

/**
 * Fetch all backend-configured pricing & duration promotion packages.
 */
export const getAdPlans = async (): Promise<AdPlanItem[]> => {
    return apiClient.get<AdPlanItem[]>("/api/adsense/plans/");
};
