import { authApiClient } from '@/lib/api/auth-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order, StructuredOrderCreate, OrderStatus } from '@/types/marketplace.types';

export const orderService = {
    /**
     * Fetch all orders for the current user.
     * Accessible by both Owners (viewing their placed orders) and Vendors (viewing orders received).
     */
    getOrders: async () => {
        const response = await authApiClient.get<any>(API_ENDPOINTS.ORDERS.LIST);
        // Handle both direct array and wrapped response formats
        if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) return response.data as Order[];
            if (Array.isArray(response.results)) return response.results as Order[];
            if (Array.isArray(response)) return response as Order[];
        }
        return Array.isArray(response) ? response : [];
    },

    /**
     * Create a structured order (from catalog).
     */
    createStructuredOrder: async (data: StructuredOrderCreate) => {
        return authApiClient.post<{ success: boolean; data: Order }>(
            API_ENDPOINTS.ORDERS.CREATE_STRUCTURED, 
            data
        );
    },

    /**
     * Create an image scan order (handwritten list).
     */
    createImageScanOrder: async (data: FormData) => {
        return authApiClient.post<{ success: boolean; data: Order }>(
            API_ENDPOINTS.ORDERS.CREATE_IMAGE_SCAN, 
            data
        );
    },

    /**
     * Update order status (Vendor specific).
     */
    updateOrderStatus: async (id: number | string, status: OrderStatus) => {
        return authApiClient.patch<{ success: boolean; data: Order }>(
            API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), 
            { status }
        );
    },

    /**
     * Get order details.
     */
    getOrderDetail: async (id: number | string) => {
        return authApiClient.get<Order>(`${API_ENDPOINTS.ORDERS.LIST}${id}/`);
    }
};
