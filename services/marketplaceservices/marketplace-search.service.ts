import { authApiClient } from '@/lib/api/auth-client';
import { Vendor, Product } from '@/types/marketplace.types';

export const marketplaceSearchService = {
    /**
     * Dedicated search for the marketplace to discover vendors and products.
     */
    search: async (query: string, type: 'vendors' | 'products' | 'all' = 'all') => {
        if (!query.trim()) return { success: true, data: { vendors: [], products: [] } };
        
        return authApiClient.get<{
            success: boolean;
            query: string;
            data: {
                vendors: Vendor[];
                products: Product[];
            }
        }>('/api/marketplace/search/', {
            params: { search: query, type }
        });
    }
};
