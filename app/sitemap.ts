import { MetadataRoute } from "next";
import { safeFetch } from "@/lib/safe-fetch";
import { HostelListItem } from "@/types/hostel.types";
import { BlogPostListItem } from "@/types/blog.types";

interface CityItem {
    id: number;
    name: string;
    slug: string;
}

/**
 * Sitemap Generation
 * 
 * Generates a sitemap for SEO. Uses safeFetch to ensure that
 * API failures during the build process do not crash the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ─── CONFIGURATION ───
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

    // ─── DATA FETCHING (SAFE) ───
    // Using safeFetch to return [] instead of throwing on API error
    const [hostels, cities, blogs] = await Promise.all([
        safeFetch<HostelListItem>(`${apiUrl}/api/hostels/`),
        safeFetch<CityItem>(`${apiUrl}/api/locations/cities/`),
        safeFetch<BlogPostListItem>(`${apiUrl}/api/blog/blog/posts/`),
    ]);

    // ─── SITEMAP ENTRIES ───

    // 1. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, priority: 1, lastModified: new Date() },
        { url: `${baseUrl}/faqs`, priority: 0.7, lastModified: new Date() },
        { url: `${baseUrl}/about-us`, priority: 0.6, lastModified: new Date() },
        { url: `${baseUrl}/contact-us`, priority: 0.6, lastModified: new Date() },
        { url: `${baseUrl}/blog`, priority: 0.7, lastModified: new Date() },
    ];

    // 2. City Pages (Dynamic)
    const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
        url: `${baseUrl}/hostels-in-${city.slug}/`,
        priority: 0.8,
        lastModified: new Date(),
    }));

    // 3. Hostel Pages (Dynamic)
    const hostelRoutes: MetadataRoute.Sitemap = hostels.map((hostel) => ({
        url: `${baseUrl}/hostels/${hostel.slug}`,
        priority: 0.7,
        lastModified: new Date(),
    }));

    // 4. Blog Posts (Dynamic)
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        priority: 0.6,
        lastModified: new Date(),
    }));

    return [...staticRoutes, ...cityRoutes, ...hostelRoutes, ...blogRoutes];
}
