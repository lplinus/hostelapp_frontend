import {
    BlogHero,
    BlogPostListItem,
    BlogPostDetail,
    BlogCategory,
} from "@/types/blog.types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Strips the Django backend base URL from image paths so they become
 * relative paths (e.g. "/media/blog/img.png") that the Next.js
 * rewrites proxy can serve from the same origin.
 */
function toRelativeImageUrl(url: string | null): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return parsed.pathname;
    } catch {
        // Already a relative path
        return url;
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

    const posts: BlogPostListItem[] = await res.json();

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

    return res.json();
}

