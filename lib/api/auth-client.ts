import { APIClient } from './client';

class AuthAPIClient extends APIClient {
    private getToken(): string | null {
        // Implement token retrieval strategy here
        // Works properly on the client side since we don't have native access to next/headers cookies here directly.
        // However, on server components, you should pass tokens down via headers or cookies() in the specific calls.
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )access=([^;]+)'));
            if (match) return match[2];
        }
        return null;
    }

    protected async fetch<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        options: Omit<RequestInit, 'method'> & { params?: Record<string, string | number | boolean | undefined> } = {}
    ): Promise<T> {
        const token = this.getToken();

        const headers = new Headers(options.headers || {});
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const updatedOptions = { ...options, headers };

        try {
            return await super.fetch<T>(endpoint, method, updatedOptions);
        } catch (error: any) {
            if (error.status === 401) {
                // Here you would implement refresh token logic
                // 1. Call refresh endpoint
                // 2. Retry original request with new token
                // 3. Fallback: window.location.href = '/owner/login';
            }
            throw error;
        }
    }
}

export const authApiClient = new AuthAPIClient();
