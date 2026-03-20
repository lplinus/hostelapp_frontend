import { FAQ, FAQCategory } from "@/types/cms.types";
import { env } from "@/config/env";

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export interface StorageSettings {
  max_image_size_mb: number;
}

export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cms/settings/storage/`);
    if (!response.ok) {
      throw new Error("Failed to fetch storage settings");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching storage settings:", error);
    // Default fallback
    return { max_image_size_mb: 10 };
  }
};

export async function getFAQCategories(): Promise<FAQCategory[]> {
    const res = await fetch(`${API_BASE_URL}/api/cms/faq-categories/`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch FAQ categories");
    }

    return res.json();
}

export async function getFAQs(query?: string, categoryId?: number): Promise<FAQ[]> {   
    const url = new URL(`${API_BASE_URL}/api/cms/faqs/`);

    // If there is a category selected, use it. 0 represents "All"
    if (categoryId && categoryId > 0) {
        url.searchParams.append("category", categoryId.toString());
    }

    // If there is also a search query, include it (backend FAQListView is optimized for this)
    if (query && query.trim()) {
        url.searchParams.append("q", query.trim());
    }

    const res = await fetch(url.toString(), {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch FAQs");
    }

    return res.json();
}

export async function searchFAQs(query: string): Promise<FAQ[]> {
    if (!query || !query.trim()) return getFAQs();

    const url = new URL(`${API_BASE_URL}/api/cms/faqs/search/`);
    url.searchParams.append("q", query.trim());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Search failed");
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