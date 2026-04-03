import { APIClient } from './client';
import { tokenManager } from '@/lib/token';
import { refreshAccessToken } from '@/lib/auth';

/**
 * Read a cookie value by name (client-side only).
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

/**
 * Singleton refresh lock.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Ensure access token ONLY if user is authenticated.
 * Prevents refresh calls on public pages.
 */
async function ensureAccessToken(): Promise<string | null> {
    const isAuthenticated = tokenManager.getAuthFlag() === 'authenticated';

    // 🚫 Do NOT attempt refresh for public users
    if (!isAuthenticated) return null;

    const existing = tokenManager.getAccessToken();
    if (existing && tokenManager.isTokenValid(existing)) return existing;

    if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

class AuthAPIClient extends APIClient {
    protected async fetch<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        options: Omit<RequestInit, 'method'> & {
            params?: Record<string, string | number | boolean | undefined>;
        } = {}
    ): Promise<T> {
        const isAuthenticated = tokenManager.getAuthFlag() === 'authenticated';

        // ✅ Only attempt token ensure if authenticated
        let finalToken = null;
        if (isAuthenticated) {
            finalToken = await ensureAccessToken();
            if (!finalToken) {
                 if (typeof window !== 'undefined') {
                     tokenManager.clearAccessToken();
                     tokenManager.clearAuthFlag();
                     window.location.href = '/login';
                 }
                 throw new Error("Authentication expired");
            }
        }

        const token = finalToken || tokenManager.getAccessToken();
        const csrfToken = getCookie('csrftoken');

        const headers = new Headers(options.headers || {});

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        if (csrfToken && method !== 'GET') {
            headers.set('X-CSRFToken', csrfToken);
        }

        const updatedOptions: RequestInit = {
            ...options,
            headers,
            credentials: 'include',
        };

        try {
            return await super.fetch<T>(endpoint, method, updatedOptions);
        } catch (error: any) {
            if (error.status === 401) {
                // 🚫 If user is NOT authenticated → don't retry / refresh
                if (!isAuthenticated) {
                    throw error;
                }

                // Try refresh once
                const newToken = await refreshAccessToken();

                if (newToken) {
                    headers.set('Authorization', `Bearer ${newToken}`);

                    const newCsrf = getCookie('csrftoken');
                    if (newCsrf && method !== 'GET') {
                        headers.set('X-CSRFToken', newCsrf);
                    }

                    const retryOptions: RequestInit = {
                        ...options,
                        headers,
                        credentials: 'include',
                    };

                    return await super.fetch<T>(endpoint, method, retryOptions);
                }

                // 🔥 Hard logout (clean)
                if (typeof window !== 'undefined') {
                    tokenManager.clearAccessToken();
                    tokenManager.clearAuthFlag();
                    window.location.href = '/login';
                }
            }

            throw error;
        }
    }
}

export const authApiClient = new AuthAPIClient();
