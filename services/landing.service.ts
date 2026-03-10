import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { LandingPageResponse } from '@/lib/api/types';

export const landingService = {
    getLandingData: () => {
        return apiClient.get<LandingPageResponse>(API_ENDPOINTS.PUBLIC.LANDING, {
            next: { revalidate: 60 } // Next App router cache control 
        });
    }
};
