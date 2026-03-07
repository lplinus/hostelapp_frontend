// ─────────────────────────────────────────────────────────────
// lib/seo/metadataHelpers.ts
// Shared helpers for SEO metadata generation across the app.
// ─────────────────────────────────────────────────────────────

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Resolve an image path/URL to a fully qualified absolute URL
 * suitable for OpenGraph images and JSON-LD.
 *
 * Handles: full URLs, relative paths (e.g. /media/...), and null values.
 */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // Already a full URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Relative path → prepend API base
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Build a canonical URL for a given path.
 */
export function buildCanonicalUrl(path: string): string {
    return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Robots directive string based on indexing flag.
 */
export function robotsDirective(isIndexed: boolean): string {
    return isIndexed ? "index,follow" : "noindex,nofollow";
}
