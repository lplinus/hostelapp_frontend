import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { HomepageResponse } from '@/lib/api/types';

export const homepageService = {
    getHomepageData: () => {
        return apiClient.get<HomepageResponse>(API_ENDPOINTS.PUBLIC.HOMEPAGE, {
            next: { revalidate: 60 } // Next App router cache control 
        });
    }
};
