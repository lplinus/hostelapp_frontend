import { authApiClient } from '@/lib/api/auth-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Vendor, VendorDetail, Product } from '@/types/marketplace.types';

export const marketplaceService = {
    // PUBLIC VENDOR DATA (Marketplace Exploration - for Hostel Owners)
    /**
     * Get a list of active vendors in the marketplace.
     */
    getPublicVendors: async (search?: string) => {
        const query = search ? `?search=${search}` : '';
        return authApiClient.get<{ success: boolean; data: Vendor[] }>(`${API_ENDPOINTS.MARKETPLACE.PUBLIC_VENDORS}${query}`);
    },

    /**
     * Get detailed information about a vendor including their products.
     */
    getVendorDetail: async (id: number | string) => {
        return authApiClient.get<VendorDetail>(API_ENDPOINTS.MARKETPLACE.VENDOR_DETAIL(id));
    },

    /**
     * Fetch a list of all active products for discovery.
     */
    getProducts: async (params?: { category?: string; vendor?: string; search?: string }) => {
        return authApiClient.get<any>(API_ENDPOINTS.MARKETPLACE.PRODUCTS, { params });
    },

    /**
     * Fetch featured products for the marketplace showcase.
     */
    getFeaturedProducts: async (limit: number = 10) => {
        return authApiClient.get<any>(API_ENDPOINTS.MARKETPLACE.FEATURED_PRODUCTS, { params: { limit } });
    },
};
