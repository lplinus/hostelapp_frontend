import { env } from '@/config/env';
import { handleApiError } from './error-handler';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

export class APIClient {
    private baseUrl = env.NEXT_PUBLIC_API_BASE_URL;

    protected async fetch<T>(endpoint: string, method: HttpMethod, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...customOptions } = options;

        let url = `${this.baseUrl}${endpoint}`;

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

        const config: RequestInit = {
            method,
            headers: { ...defaultHeaders, ...incomingHeaders },
            ...customOptions,
        };

        // If it's FormData, let the browser define the Content-Type header with the boundary
        if (isFormData && config.headers) {
            const h = config.headers as Record<string, string>;
            delete h['Content-Type'];
            delete h['content-type'];
        }

        const response = await fetch(url, config);

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
