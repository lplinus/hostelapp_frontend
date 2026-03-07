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

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: 'guest' | 'hostel_owner';
    is_verified: boolean;
    profile_picture?: string;
    date_joined: string;
}

export interface AuthResponse {
    access: string;
    user: AuthUser;
}

export interface RegisterResponse {
    message: string;
    user: AuthUser;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: 'guest' | 'hostel_owner';
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
