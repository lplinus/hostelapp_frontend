// ─────────────────────────────────────────────────────────────
// lib/seo/hostelSeo.ts
// Generates Next.js Metadata for hostel detail pages.
// Uses API SEO fields with intelligent fallbacks.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import type { HostelDetail } from "@/types/hostel.types";
import {
    resolveImageUrl,
    buildCanonicalUrl,
    robotsDirective,
} from "./metadataHelpers";

/**
 * Build a human-readable fallback title from hostel data.
 *
 * e.g. "Urban Nest Co-Living in Gachibowli Hyderabad | StayNest"
 */
function fallbackTitle(hostel: HostelDetail): string {
    const location = [hostel.area?.name, hostel.city.name]
        .filter(Boolean)
        .join(" ");
    return `${hostel.name}${location ? ` in ${location}` : ""} | StayNest`;
}

/**
 * Build a fallback description from hostel data.
 */
function fallbackDescription(hostel: HostelDetail): string {
    const location = [hostel.area?.name, hostel.city.name]
        .filter(Boolean)
        .join(" ");
    return (
        `Book ${hostel.name}${location ? ` located in ${location}` : ""}. ` +
        `Affordable verified hostel accommodation with modern amenities.`
    );
}

/**
 * Generate Next.js Metadata for a hostel detail page.
 *
 * Priority: API SEO fields → intelligent fallback → safe defaults.
 */
export function generateHostelMetadata(hostel: HostelDetail): Metadata {
    const title = hostel.meta_title || fallbackTitle(hostel);
    const description =
        hostel.meta_description || hostel.short_description || fallbackDescription(hostel);
    const canonical =
        hostel.canonical_url || buildCanonicalUrl(`/hostels/${hostel.slug}`);

    // Resolve OG image
    const primaryImage = hostel.images.find((img) => img.is_primary) ?? hostel.images[0];
    const ogImageUrl =
        resolveImageUrl(hostel.og_image) ??
        resolveImageUrl(primaryImage?.image) ??
        resolveImageUrl(hostel.default_images?.image1) ??
        buildCanonicalUrl("/default-og-image.jpg");

    const ogTitle = hostel.og_title || title;
    const ogDescription = hostel.og_description || description;

    return {
        title,
        description,
        robots: robotsDirective(hostel.is_indexed ?? true),
        alternates: {
            canonical,
        },
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            type: (hostel.og_type as "website" | "article") || "website",
            url: canonical,
            ...(ogImageUrl && {
                images: [
                    {
                        url: ogImageUrl,
                        alt: `${hostel.name} hostel in ${hostel.city.name}`,
                    },
                ],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            ...(ogImageUrl && { images: [ogImageUrl] }),
        },
    };
}
