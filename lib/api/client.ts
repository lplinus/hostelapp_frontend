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

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        const config: RequestInit = {
            method,
            headers: { ...defaultHeaders, ...headers },
            ...customOptions,
        };

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
        return this.fetch<T>(endpoint, 'POST', {
            ...options,
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    public put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.fetch<T>(endpoint, 'PUT', {
            ...options,
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    public patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.fetch<T>(endpoint, 'PATCH', {
            ...options,
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.fetch<T>(endpoint, 'DELETE', options);
    }
}

// Global instance for unauthenticated requests
export const apiClient = new APIClient();
