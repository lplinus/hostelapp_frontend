import { FAQ, FAQCategory } from "@/types/cms.types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function getFAQCategories(): Promise<FAQCategory[]> {
    const res = await fetch(`${API_BASE_URL}/api/cms/faq-categories/`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch FAQ categories");
    }

    return res.json();
}

export async function getFAQs(): Promise<FAQ[]> {
    const res = await fetch(`${API_BASE_URL}/api/cms/faqs/`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch FAQs");
    }

    return res.json();
}

export async function getFAQBySlug(slug: string): Promise<FAQ> {
    const res = await fetch(`${API_BASE_URL}/api/cms/faqs/${slug}/`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch FAQ with slug: ${slug}`);
    }

    return res.json();
}
