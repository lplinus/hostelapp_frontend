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
    role: 'guest' | 'hostel_owner' | 'vendor';
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
    role?: 'guest' | 'hostel_owner' | 'vendor';
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

export interface LandingPageResponse {
    hero_badge: string;
    hero_title_main: string;
    hero_title_italic: string;
    hero_title_footer: string;
    hero_description: string;
    hero_primary_cta_text: string;
    hero_primary_cta_url: string;
    hero_secondary_cta_text: string;
    hero_secondary_cta_url: string;
    cities_eyebrow: string;
    cities_title_main: string;
    cities_title_italic: string;
    features_eyebrow: string;
    features_title_main: string;
    features_title_italic: string;
    features_subtitle: string;
    how_eyebrow: string;
    how_title_main: string;
    how_title_italic: string;
    how_subtitle: string;
    testimonials_eyebrow: string;
    testimonials_title_main: string;
    testimonials_title_italic: string;
    cta_bottom_eyebrow: string;
    cta_bottom_title_main: string;
    cta_bottom_title_italic: string;
    cta_bottom_subtitle: string;
    cta_bottom_button_text: string;
    cta_bottom_button_url: string;
    stats: Array<{
        number: string;
        label: string;
        icon_name: string;
        color_gradient: string;
    }>;
    cities: Array<{
        city_name: string;
        count_text: string;
        image: string | null;
        span_large: boolean;
        gradient: string;
    }>;
    features: Array<{
        icon_name: string;
        title: string;
        text: string;
    }>;
    steps: Array<{
        step_number: string;
        icon_name: string;
        title: string;
        text: string;
    }>;
    testimonials: Array<{
        text: string;
        name: string;
        role: string;
        initial: string;
    }>;
}
