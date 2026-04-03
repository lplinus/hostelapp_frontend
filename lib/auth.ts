import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuthResponse, AuthUser, RegisterData, RegisterResponse } from '@/lib/api/types';
import { tokenManager } from '@/lib/token';
import { env } from '@/config/env';

const BASE_URL = typeof window !== 'undefined' ? '' : env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Read a cookie value by name (client-side only).
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

/**
 * Core authentication functions.
 * These handle the raw API calls and token management.
 */

export async function loginUser(credentials: {
    username: string;
    password: string;
}): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: sends/receives cookies
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            error?.detail ||
            error?.non_field_errors?.[0] ||
            'Invalid credentials. Please try again.'
        );
    }

    const data: AuthResponse = await response.json();

    // Store access token in memory
    tokenManager.setAccessToken(data.access);
    tokenManager.setAuthFlag();

    return data;
}

export async function registerUser(
    userData: RegisterData
): Promise<RegisterResponse> {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Handle field-level validation errors from DRF
        const fieldErrors = Object.entries(error)
            .filter(([key]) => key !== 'detail' && key !== 'non_field_errors')
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join(', ');

        throw new Error(
            fieldErrors ||
            error?.detail ||
            error?.non_field_errors?.[0] ||
            'Registration failed. Please try again.'
        );
    }

    return response.json();
}

export async function refreshAccessToken(): Promise<string | null> {
    try {
        const csrfToken = getCookie('csrftoken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }

        const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers,
            credentials: 'include', // Send refresh token cookie
        });

        if (!response.ok) {
            console.warn(`[Auth] Token refresh failed with status: ${response.status}`);
            // Only clear auth state on 401 (invalid/expired refresh token)
            // Don't clear on network errors or server errors
            if (response.status === 401 || response.status === 403) {
                tokenManager.clearAccessToken();
                tokenManager.clearAuthFlag();
            }
            return null;
        }

        const data = await response.json();
        tokenManager.setAccessToken(data.access);
        tokenManager.setAuthFlag();
        return data.access;
    } catch (err) {
        console.warn('[Auth] Token refresh network error:', err);
        // Don't clear auth state on network errors — the token might still be valid
        return null;
    }
}

export async function logoutUser(): Promise<void> {
    const token = tokenManager.getAccessToken();
    const csrfToken = getCookie('csrftoken');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;

    try {
        await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
            method: 'POST',
            headers,
            credentials: 'include', // Send refresh token cookie for blacklisting
        });
    } catch {
        // Logout should always succeed on the client side
    } finally {
        tokenManager.clearAccessToken();
        tokenManager.clearAuthFlag();
    }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
    const token = tokenManager.getAccessToken();

    if (!tokenManager.isTokenValid(token)) {
        // Try refreshing first
        const newToken = await refreshAccessToken();
        if (!newToken) return null;
    }

    const currentToken = tokenManager.getAccessToken();
    if (!tokenManager.isTokenValid(currentToken)) return null;

    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Token might be expired, try refresh
            const newToken = await refreshAccessToken();
            if (newToken) {
                const retryResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${newToken}`,
                    },
                    credentials: 'include',
                });
                if (retryResponse.ok) {
                    return retryResponse.json();
                }
            }
        }
        return null;
    }

    return response.json();
}
