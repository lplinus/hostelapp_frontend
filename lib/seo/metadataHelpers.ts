// ─────────────────────────────────────────────────────────────
// lib/seo/metadataHelpers.ts
// Shared helpers for SEO metadata generation across the app.
// ─────────────────────────────────────────────────────────────

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://hostelin.online";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online";

const REQUIRE_TRAILING_SLASH = true; // Match next.config.ts

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
    // If it's a media URL, it should typically use the API base
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Build a canonical URL for a given path.
 */
export function buildCanonicalUrl(path: string): string {
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // If trailing slash is required and the path doesn't have one (and isn't a file/root)
    if (REQUIRE_TRAILING_SLASH && !cleanPath.endsWith("/") && !cleanPath.includes(".")) {
        cleanPath = `${cleanPath}/`;
    }

    return `${SITE_URL}${cleanPath}`;
}

/**
 * Robots directive string based on indexing flag.
 */
export function robotsDirective(isIndexed: boolean): string {
    return isIndexed ? "index,follow" : "noindex,nofollow";
}
