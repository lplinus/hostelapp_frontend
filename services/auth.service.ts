import { apiClient } from '@/lib/api/client';
import { authApiClient } from '@/lib/api/auth-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
    AuthResponse,
    AuthUser,
    RegisterResponse,
    LoginCredentials,
    RegisterData,
} from '@/lib/api/types';

export const authService = {
    login: (credentials: LoginCredentials) => {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
            credentials: 'include',
        });
    },

    register: (userData: RegisterData) => {
        return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
    },

    logout: () => {
        return authApiClient.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, {
            credentials: 'include',
        });
    },

    refresh: () => {
        return apiClient.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH, undefined, {
            credentials: 'include',
        });
    },

    me: () => {
        return authApiClient.get<AuthUser>(API_ENDPOINTS.AUTH.ME);
    },

    verifyEmail: (data: { email: string; code: string }) => {
        return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    },

    sendOtp: (phone?: string) => {
        return authApiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { phone });
    },

    verifyOtp: (code: string, phone?: string) => {
        return authApiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { code, phone });
    },
};
