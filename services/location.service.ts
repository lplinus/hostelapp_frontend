const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export interface CityItem {
    id: number;
    name: string;
    slug: string;
}

export interface AreaItem {
    id: number;
    name: string;
    slug: string;
    city: number;
}

export async function getCities(): Promise<CityItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/locations/cities/`);
    if (!res.ok) throw new Error("Failed to fetch cities");
    return res.json();
}

export async function getAreas(): Promise<AreaItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/locations/areas/`);
    if (!res.ok) throw new Error("Failed to fetch areas");
    return res.json();
}
