import { authApiClient } from "@/lib/api/auth-client";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export interface AmenityItem {
    id: number;
    name: string;
    icon: string | null;
}

export async function getAmenities(): Promise<AmenityItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/amenities/`);
    if (!res.ok) throw new Error("Failed to fetch amenities");
    return res.json();
}

export async function createAmenity(name: string): Promise<AmenityItem> {
    const response = await authApiClient.post('/api/amenities/', { name });
    return response as AmenityItem;
}
