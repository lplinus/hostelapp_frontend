// ─────────────────────────────────────────────────────────────
// lib/seo/structuredData.ts
// JSON-LD structured data generators for hostel detail pages.
// Schema: https://schema.org/Hostel
// ─────────────────────────────────────────────────────────────

import type { HostelDetail } from "@/types/hostel.types";
import { resolveImageUrl } from "./metadataHelpers";

/**
 * Build a Schema.org Hostel JSON-LD object.
 *
 * Falls back gracefully when optional fields are missing.
 * If `hostel.structured_data` is already set by the backend, it is
 * returned verbatim (backend override takes priority).
 */
export function generateHostelJsonLd(
    hostel: HostelDetail
): Record<string, unknown> {
    // Backend-managed override
    if (hostel.structured_data) {
        return hostel.structured_data;
    }

    const primaryImage = hostel.images.find((img) => img.is_primary) ?? hostel.images[0];
    const imageUrl =
        resolveImageUrl(primaryImage?.image) ??
        resolveImageUrl(hostel.default_images?.image1);

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Hostel",
        name: hostel.name,
        description:
            hostel.meta_description ?? hostel.short_description ?? hostel.description,
        url: hostel.canonical_url ?? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/hostels/${hostel.slug}`,
    };

    // Image
    if (imageUrl) {
        jsonLd.image = imageUrl;
    }

    // Address
    jsonLd.address = {
        "@type": "PostalAddress",
        streetAddress: hostel.address,
        ...(hostel.area && { addressLocality: hostel.area.name }),
        addressRegion: hostel.city.name,
        ...(hostel.postal_code && { postalCode: hostel.postal_code }),
        addressCountry: "IN",
    };

    // Geo coordinates
    if (hostel.latitude && hostel.longitude) {
        jsonLd.geo = {
            "@type": "GeoCoordinates",
            latitude: hostel.latitude,
            longitude: hostel.longitude,
        };
    }

    // Aggregate rating (only if there are reviews)
    if (hostel.rating_count > 0) {
        jsonLd.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: hostel.rating_avg,
            reviewCount: hostel.rating_count,
            bestRating: 5,
            worstRating: 1,
        };
    }

    // Check-in / check-out
    if (hostel.check_in_time) {
        jsonLd.checkinTime = hostel.check_in_time;
    }
    if (hostel.check_out_time) {
        jsonLd.checkoutTime = hostel.check_out_time;
    }

    // Price
    if (hostel.final_price ?? hostel.price) {
        jsonLd.priceRange = `₹${hostel.final_price ?? hostel.price}`;
    }

    // Amenities as list of strings
    if (hostel.amenities.length > 0) {
        jsonLd.amenityFeature = hostel.amenities.map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a.name,
            value: true,
        }));
    }

    return jsonLd;
}
