// ─────────────────────────────────────────────────────────────
// types/public.types.ts
// Strict TypeScript interfaces for all public page API responses.
// These mirror the Django REST Framework serializers exactly.
// ─────────────────────────────────────────────────────────────

// ── Homepage ────────────────────────────────────────────────

export interface WhyUsItem {
    id: number;
    title: string;
    description: string;
    icon: string;
    order: number | null;
    is_active: boolean | null;
    created_at: string | null;
    homepage: number;
}

export interface HomePageResponse {
    id: number;
    hero_title: string;
    hero_subtitle: string;
    cta_title: string;
    cta_subtitle: string;
    cta_button_text: string;
    why_title: string;
    updated_at: string;
    why_items: WhyUsItem[];
}

// ── About Page ──────────────────────────────────────────────

export interface AboutStat {
    label: string;
    value: string;
}

export interface AboutValue {
    icon_name: string;
    title: string;
    description: string;
}

export interface AboutTeamMember {
    name: string;
    role: string;
    photo: string;
}

export interface AboutPageResponse {
    hero_title: string;
    hero_subtitle: string;
    mission_title: string;
    mission_description: string;
    mission_card_title: string;
    mission_card_description: string;
    cta_title: string;
    cta_button_text: string;
    cta_button_url: string;
    stats: AboutStat[];
    values: AboutValue[];
    team_members: AboutTeamMember[];
}

// ── Contact Page ────────────────────────────────────────────

export interface ContactInfoItem {
    icon_name: string;
    title: string;
    value: string;
}

export interface ContactFAQItem {
    question: string;
    answer: string;
}

export interface ContactPageResponse {
    hero_title: string;
    hero_subtitle: string;
    cta_title: string;
    cta_button_text: string;
    cta_button_url: string;
    info_items: ContactInfoItem[];
    faqs: ContactFAQItem[];
}

// ── Contact Message (POST body & response) ──────────────────

export interface ContactMessagePayload {
    name: string;
    email: string;
    message: string;
}

export interface ContactMessageResponse {
    id: number;
    name: string;
    email: string;
    message: string;
}

// ── Pricing Page ────────────────────────────────────────────

export interface PricingFeature {
    feature_text: string;
}

export interface PricingPlan {
    name: string;
    description: string;
    price: string;
    currency_symbol: string;
    period: string;
    is_highlighted: boolean;
    features: PricingFeature[];
}

export interface PricingFAQItem {
    question: string;
    answer: string;
}

export interface PricingPageResponse {
    hero_title: string;
    hero_subtitle: string;
    comparison_title: string;
    comparison_description: string;
    cta_title: string;
    cta_button_text: string;
    cta_button_url: string;
    plans: PricingPlan[];
    faqs: PricingFAQItem[];
}
