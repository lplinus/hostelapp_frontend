/**
 * Safe Fetch Utility
 *
 * A reusable wrapper around the native fetch API designed for use during
 * static generation (sitemap, metadata, etc.). It catches errors and
 * prevents build-time crashes by returning an empty array on failure.
 */
export async function safeFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T[]> {
  try {
    const res = await fetch(url, {
      ...options,
      // Default cache settings for sitemap generation
      next: { revalidate: 3600, ...(options.next || {}) },
    });

    if (!res.ok) {
      console.warn(`[SafeFetch Warning] Failed to fetch from ${url}: Status ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Handle DRF style paginated results or direct array
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
        return data.results;
    }

    return [];
  } catch (error) {
    console.error(`[SafeFetch Error] Unhandled exception fetching ${url}:`, error);
    return [];
  }
}
