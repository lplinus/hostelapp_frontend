import { authApiClient } from '@/lib/api/auth-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { HomepageResponse } from '@/lib/api/types';

export const adminService = {
    updateHomepage: (id: string | number, payload: Partial<HomepageResponse>) => {
        return authApiClient.patch<HomepageResponse>(
            `${API_ENDPOINTS.ADMIN.HOMEPAGE}${id}/`,
            payload
        );
    },

    deleteWhyUs: (id: string | number) => {
        return authApiClient.delete(API_ENDPOINTS.ADMIN.WHY_US_DETAIL(id));
    }
};
