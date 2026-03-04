export interface APIResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

export interface HomepageResponse {
    hero_title: string;
    hero_subtitle: string;
    cta_title: string;
    cta_subtitle: string;
    cta_button_text: string;
    why_title: string;
    why_items: Array<{
        id: number;
        title: string;
        description: string;
        icon: string;
    }>;
}

export interface HostelResponse {
    id: number;
    name: string;
    location: string;
    price_per_night: number;
}
