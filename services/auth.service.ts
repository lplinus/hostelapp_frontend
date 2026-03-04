import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuthResponse } from '@/lib/api/types';

export const authService = {
    login: (credentials: Record<string, any>) => {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },

    register: (userData: Record<string, any>) => {
        return apiClient.post<{ message: string; user: any }>(API_ENDPOINTS.AUTH.REGISTER, userData);
    },

    logout: () => {
        return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    }
};
