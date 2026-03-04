// ─────────────────────────────────────────────────────────────
// lib/services/public.service.ts
// Centralized service for all public page API calls.
// Uses the existing APIClient + endpoints pattern.
// ─────────────────────────────────────────────────────────────

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
    HomePageResponse,
    AboutPageResponse,
    ContactPageResponse,
    ContactMessagePayload,
    ContactMessageResponse,
    PricingPageResponse,
} from "@/types/public.types";

/**
 * Fetch homepage content (hero, CTA, why-us items).
 * Server Component safe — uses `next: { revalidate: 60 }` for ISR.
 */
export async function getHomePage(): Promise<HomePageResponse> {
    return apiClient.get<HomePageResponse>(API_ENDPOINTS.PUBLIC.HOMEPAGE, {
        next: { revalidate: 60 },
    });
}

/**
 * Fetch about page content (hero, mission, stats, values, team).
 */
export async function getAboutPage(): Promise<AboutPageResponse> {
    return apiClient.get<AboutPageResponse>(API_ENDPOINTS.PUBLIC.ABOUT, {
        next: { revalidate: 60 },
    });
}

/**
 * Fetch contact page content (hero, info items, FAQs, CTA).
 */
export async function getContactPage(): Promise<ContactPageResponse> {
    return apiClient.get<ContactPageResponse>(API_ENDPOINTS.PUBLIC.CONTACT, {
        next: { revalidate: 60 },
    });
}

/**
 * Fetch pricing page content (hero, plans with features, FAQs, CTA).
 */
export async function getPricingPage(): Promise<PricingPageResponse> {
    return apiClient.get<PricingPageResponse>(API_ENDPOINTS.PUBLIC.PRICING, {
        next: { revalidate: 60 },
    });
}

/**
 * POST a contact form message.
 * Called from a Client Component — no caching needed.
 */
export async function sendContactMessage(
    payload: ContactMessagePayload
): Promise<ContactMessageResponse> {
    return apiClient.post<ContactMessageResponse>(
        API_ENDPOINTS.PUBLIC.CONTACT_MESSAGE,
        payload
    );
}
