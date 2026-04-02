import { authApiClient } from '@/lib/api/auth-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Vendor, Product, Order, OrderStatus } from '@/types/marketplace.types';

export const vendorService = {
    // VENDOR PROFILE MANAGEMENT
    /**
     * Get the current user's vendor profile.
     */
    getMyVendorProfile: async () => {
        const response = await authApiClient.get<any>(`${API_ENDPOINTS.MARKETPLACE.VENDORS}me/`);
        // The me endpoint returns a single Vendor object
        if (response && response.success && response.data) return response.data as Vendor;
        return response as Vendor;
    },

    /**
     * Create a new vendor profile for the current user.
     */
    createVendorProfile: async (data: Partial<Vendor>) => {
        return authApiClient.post<{ success: boolean; data: Vendor }>(
            API_ENDPOINTS.MARKETPLACE.VENDORS, 
            data
        );
    },

    /**
     * Update existing vendor profile.
     */
    updateVendorProfile: async (id: number | string, data: Partial<Vendor>) => {
        return authApiClient.patch<{ success: boolean; data: Vendor }>(
            `${API_ENDPOINTS.MARKETPLACE.VENDORS}${id}/`, 
            data
        );
    },

    // PRODUCT MANAGEMENT (Catalog)
    /**
     * Get all products belonging to the current user's vendor.
     */
    getMyProducts: async () => {
        const response = await authApiClient.get<any>(`${API_ENDPOINTS.MARKETPLACE.PRODUCTS}?mine=true`);
        // Handle { success: true, data: [] }, paginated { results: [] }, and raw []
        if (response && typeof response === 'object') {
            if (response.success && Array.isArray(response.data)) return response.data as Product[];
            if (Array.isArray(response.results)) return response.results as Product[];
            if (Array.isArray(response)) return response as Product[];
        }
        return Array.isArray(response) ? response : [];
    },

    /**
     * Create a new product.
     */
    createProduct: async (data: FormData) => {
        return authApiClient.post<{ success: boolean; data: Product }>(
            API_ENDPOINTS.MARKETPLACE.PRODUCTS, 
            data
        );
    },

    /**
     * Update an existing product.
     */
    updateProduct: async (id: number | string, data: FormData | Partial<Product>) => {
        return authApiClient.patch<{ success: boolean; data: Product }>(
            `${API_ENDPOINTS.MARKETPLACE.PRODUCTS}${id}/`, 
            data
        );
    },

    /**
     * Delete a product.
     */
    deleteProduct: async (id: number | string) => {
        return authApiClient.delete(`${API_ENDPOINTS.MARKETPLACE.PRODUCTS}${id}/`);
    },

    // VENDOR ORDER MANAGEMENT (Fulfillment)
    /**
     * Get orders received by this vendor.
     * Note: The backend filters these based on the authenticated user's vendor ownership.
     */
    getVendorOrders: async () => {
        const response = await authApiClient.get<any>(API_ENDPOINTS.ORDERS.LIST);
        // Handle both wrapped { success: true, data: [] } and paginated { results: [] }
        if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) return response.data as Order[];
            if (Array.isArray(response.results)) return response.results as Order[];
            if (Array.isArray(response)) return response as Order[];
        }
        return Array.isArray(response) ? (response as Order[]) : [];
    },

    /**
     * Update the status of a received order (e.g., transition from Pending to Processing).
     */
    updateOrderStatus: async (id: number | string, status: OrderStatus) => {
        return authApiClient.patch<{ success: boolean; data: Order }>(
            API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), 
            { status }
        );
    },

    /**
     * Get detailed info for a specific order.
     */
    /**
     * Get all active categories for product classification.
     */
    getCategories: async () => {
        const response = await authApiClient.get<any>(API_ENDPOINTS.MARKETPLACE.CATEGORIES);
        // Handle { success: true, data: [] }, paginated { results: [] }, and raw []
        if (response && typeof response === 'object') {
            if (response.success && Array.isArray(response.data)) return response.data;
            if (Array.isArray(response.results)) return response.results;
            if (Array.isArray(response)) return response;
        }
        return Array.isArray(response) ? response : [];
    }
};
