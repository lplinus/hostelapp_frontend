import { env } from '@/config/env';
import { handleApiError } from './error-handler';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

export class APIClient {
    // private baseUrl = typeof window !== 'undefined' ? '' : env.NEXT_PUBLIC_API_BASE_URL;
    private baseUrl = env.NEXT_PUBLIC_API_BASE_URL;

    protected async fetch<T>(endpoint: string, method: HttpMethod, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...customOptions } = options;

        // Ensure endpoint has a trailing slash for Django compatibility
        const normalizedEndpoint = (endpoint.endsWith('/') || endpoint.includes('?') || endpoint.includes('#'))
            ? endpoint
            : `${endpoint}/`;

        let url = `${this.baseUrl}${normalizedEndpoint}`;

        // Append query params if any
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const isFormData = typeof FormData !== 'undefined' && customOptions.body instanceof FormData;

        const defaultHeaders: Record<string, string> = {
            Accept: 'application/json',
        };

        if (!isFormData) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        // Convert Headers instance to plain object (spreading a Headers instance yields {})
        let incomingHeaders: Record<string, string> = {};
        if (headers instanceof Headers) {
            headers.forEach((value, key) => {
                incomingHeaders[key] = value;
            });
        } else if (headers) {
            incomingHeaders = headers as Record<string, string>;
        }

        // For non-GET methods, use 'manual' redirect so the browser doesn't
        // silently convert POST → GET on a 301/302/307 (losing the body).
        // For GET, 'follow' is safe and avoids extra round-trips.
        const isMutation = method !== 'GET';

        const config: RequestInit = {
            method,
            headers: { ...defaultHeaders, ...incomingHeaders },
            credentials: 'include' as RequestCredentials,
            redirect: isMutation ? 'manual' : 'follow',
            ...customOptions,
        };

        // If it's FormData, let the browser define the Content-Type header with the boundary
        if (isFormData && config.headers) {
            const h = config.headers as Record<string, string>;
            delete h['Content-Type'];
            delete h['content-type'];
        }

        let response = await fetch(url, config);

        // Handle manual redirects for mutations — follow the Location header
        // with the SAME method and body so POST data is never lost.
        if (isMutation && response.type === 'opaqueredirect') {
            // opaqueredirect means we got a redirect but redirect: 'manual' hid it
            // Re-issue to the trailing-slash URL directly
            const locationUrl = normalizedEndpoint.endsWith('/')
                ? url
                : `${url}/`;
            response = await fetch(locationUrl, { ...config, redirect: 'follow' });
        }

        // Safety: if status is 3xx (redirect response visible in manual mode),
        // follow the Location header once.
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('Location');
            if (location) {
                const redirectUrl = location.startsWith('http')
                    ? location
                    : `${this.baseUrl}${location}`;
                response = await fetch(redirectUrl, { ...config, redirect: 'follow' });
            }
        }

        if (!response.ok) {
            await handleApiError(response);
        }

        // For DELETE or 204 No Content, we might not have JSON to parse
        if (response.status === 204 || method === 'DELETE') {
            return {} as T;
        }

        return response.json();
    }

    public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.fetch<T>(endpoint, 'GET', options);
    }

    public post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.fetch<T>(endpoint, 'POST', {
            ...options,
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        });
    }

    public put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.fetch<T>(endpoint, 'PUT', {
            ...options,
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        });
    }

    public patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.fetch<T>(endpoint, 'PATCH', {
            ...options,
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        });
    }

    public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.fetch<T>(endpoint, 'DELETE', options);
    }
}

// Global instance for unauthenticated requests
export const apiClient = new APIClient();
