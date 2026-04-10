import { HostelListItem, HostelDetail, HostelImage, DefaultHostelImage } from "@/types/hostel.types";
import { authApiClient } from "@/lib/api/auth-client";
import { env } from "@/config/env";

const API_BASE_URL = typeof window !== 'undefined' ? '' : env.NEXT_PUBLIC_API_BASE_URL;

function toRelativeImageUrl(url: string | null): string | null {
    if (!url) return null;
    // If it's an ImageKit URL, return it as-is (external CDN)
    if (url.includes("ik.imagekit.io")) return url;
    try {
        const parsed = new URL(url);
        // Only strip to pathname for our own backend URLs
        if (API_BASE_URL && url.startsWith(API_BASE_URL)) {
            return parsed.pathname;
        }
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
            return parsed.pathname;
        }
        // For any other external URL, return as-is
        return url;
    } catch {
        return url;
    }
}

function processHostelImages(
    images: readonly HostelImage[]
): HostelImage[] {
    return images.map((img) => ({
        ...img,
        image: toRelativeImageUrl(img.image),
        image2: toRelativeImageUrl(img.image2),
        image3: toRelativeImageUrl(img.image3),
        image4: toRelativeImageUrl(img.image4),
    }));
}

function processDefaultImages(
    defaults: DefaultHostelImage | null | undefined
): DefaultHostelImage | null {
    if (!defaults) return null;
    return {
        ...defaults,
        image1: toRelativeImageUrl(defaults.image1),
        image2: toRelativeImageUrl(defaults.image2),
        image3: toRelativeImageUrl(defaults.image3),
        image4: toRelativeImageUrl(defaults.image4),
    };
}

// export async function getHostels(): Promise<HostelListItem[]> {
//     const res = await fetch(`${API_BASE_URL}/api/hostels/`, {
//         next: { revalidate: 60 },
//     });

//     if (!res.ok) {
//         throw new Error("Failed to fetch hostels");
//     }

//     const hostels: HostelListItem[] = await res.json();

//     return hostels.map((hostel) => ({
//         ...hostel,
//         images: processHostelImages(hostel.images),
//         default_images: processDefaultImages(hostel.default_images),
//     }));
// }
export async function getHostels(): Promise<HostelListItem[]> {
    // const res = await fetch(`${API_BASE_URL}/api/hostels/`, {
    const res = await fetch(`${API_BASE_URL}/api/hostels/hostels/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch hostels");
    }

    const data = await res.json();

    const hostels: HostelListItem[] = Array.isArray(data)
        ? data
        : data?.results || [];

    return hostels.map((hostel) => ({
        ...hostel,
        images: processHostelImages(hostel.images || []),
        default_images: processDefaultImages(hostel.default_images),
    }));
}
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export async function getFeaturedHostels(): Promise<HostelListItem[]> {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HOSTELS.FEATURED}`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        console.error("Failed to fetch featured hostels");
        return [];
    }

    const data = await res.json();

    const hostels: HostelListItem[] = Array.isArray(data)
        ? data
        : data?.results || [];

    return hostels.map((hostel) => ({
        ...hostel,
        images: processHostelImages(hostel.images || []),
        default_images: processDefaultImages(hostel.default_images),
    }));
}

export async function getTopRatedHostels(): Promise<HostelListItem[]> {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HOSTELS.TOP_RATED}`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        console.error("Failed to fetch top rated hostels");
        return [];
    }

    const data = await res.json();

    const hostels: HostelListItem[] = Array.isArray(data)
        ? data
        : data?.results || [];

    return hostels.map((hostel) => ({
        ...hostel,
        images: processHostelImages(hostel.images || []),
        default_images: processDefaultImages(hostel.default_images),
    }));
}

export async function getHostelBySlug(
    slug: string,
    noCache: boolean = false
): Promise<HostelDetail> {
    const res = await fetch(`${API_BASE_URL}/api/hostels/${slug}/`, {
        cache: noCache ? "no-store" : "default",
        next: noCache ? undefined : { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch hostel: ${slug}`);
    }

    const hostel: HostelDetail = await res.json();

    return {
        ...hostel,
        images: processHostelImages(hostel.images),
        default_images: processDefaultImages(hostel.default_images),
    };
}

export async function getMyHostels(): Promise<HostelListItem[]> {
    const hostels = await authApiClient.get<HostelListItem[]>("/api/hostels/hostels/my-hostels/");
    return hostels.map((hostel) => ({
        ...hostel,
        images: processHostelImages(hostel.images || []),
        default_images: processDefaultImages(hostel.default_images),
    }));
}

export async function getMyHostelById(id: number | string): Promise<HostelListItem> {
    return authApiClient.get<HostelListItem>(`/api/hostels/hostels/my-hostels/${id}/`);
}

export async function createHostel(data: FormData): Promise<any> {
    return authApiClient.post("/api/hostels/hostels/", data);
}

export async function updateHostel(id: number | string, data: Record<string, any>): Promise<any> {
    return authApiClient.patch(`/api/hostels/hostels/my-hostels/${id}/update/`, data);
}

export async function deleteHostel(id: number | string): Promise<void> {
    return authApiClient.delete(`/api/hostels/hostels/my-hostels/${id}/delete/`);
}

export async function postReview(data: {
    hostel: number;
    hostel_rating: number;
    food_rating: number;
    room_rating: number;
    comment: string;
    name?: string
}): Promise<any> {
    return authApiClient.post("/api/reviews/", data);
}

export async function getReviewsByHostel(hostelId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/reviews/?hostel=${hostelId}`, {
        cache: "no-store", // We want the latest reviews for polling
    });

    if (!res.ok) {
        throw new Error("Failed to fetch reviews");
    }

    return res.json();
}
