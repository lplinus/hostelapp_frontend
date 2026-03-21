import {
    BlogHero,
    BlogPostListItem,
    BlogPostDetail,
    BlogCategory,
} from "@/types/blog.types";
import { env } from "@/config/env";

const API_BASE_URL = typeof window !== 'undefined' ? '' : env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Strips the Django backend base URL from image paths so they become
 * relative paths (e.g. "/media/blog/img.png") that the Next.js
 * rewrites proxy can serve from the same origin.
 */
function toRelativeImageUrl(url: string | null): string | null {
    if (!url) return null;
    const s = String(url);
    // If it's an ImageKit URL, return it as-is (external CDN)
    if (s.includes("ik.imagekit.io")) return s;

    try {
        const parsed = new URL(s);
        // Only strip to pathname for our own backend URLs
        if (API_BASE_URL && s.startsWith(API_BASE_URL)) {
            return parsed.pathname;
        }
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
            return parsed.pathname;
        }
        // For any other external URL, return as-is
        return s;
    } catch {
        // Already a relative path or invalid URL
        return s;
    }
}

export async function getBlogHero(): Promise<BlogHero> {
    const res = await fetch(`${API_BASE_URL}/api/blog/blog/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch blog hero");
    }

    return res.json();
}

export async function getBlogPosts(): Promise<BlogPostListItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/blog/blog/posts/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch blog posts");
    }

    const data = await res.json();
    const posts: BlogPostListItem[] = Array.isArray(data) ? data : data.results || [];

    return posts.map((post) => ({
        ...post,
        banner_image: toRelativeImageUrl(post.banner_image),
        featured_image: toRelativeImageUrl(post.featured_image),
    }));
}

export async function getBlogPostBySlug(
    slug: string
): Promise<BlogPostDetail> {
    const res = await fetch(`${API_BASE_URL}/api/blog/blog/posts/${slug}/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch blog post by slug: ${slug}`);
    }

    const post: BlogPostDetail = await res.json();

    return {
        ...post,
        banner_image: toRelativeImageUrl(post.banner_image),
        featured_image: toRelativeImageUrl(post.featured_image),
        featured_image2: toRelativeImageUrl(post.featured_image2),
        featured_image3: toRelativeImageUrl(post.featured_image3),
    };
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
    const res = await fetch(`${API_BASE_URL}/api/blog/blog/categories/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch blog categories");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
}

